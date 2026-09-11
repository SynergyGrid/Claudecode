# n8n Bedrock Cost Investigation — Read-Only Command Set

Run these on the **Jarvez host** (the machine running n8n). Every command
here is read-only: no writes, no deletes, no workflow or credential changes.

Paste the output of each step back to Claude before moving to the next one.

Target period: **2026-05-25 to 2026-07-10**.

---

## Step 1 — Locate the installation and its database

```bash
# Is it in Docker?
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | grep -i n8n
docker inspect $(docker ps -aqf name=n8n) --format '{{json .Mounts}}' 2>/dev/null

# Or native?
ps aux | grep -i '[n]8n'
systemctl status n8n 2>/dev/null | head -20
ls -la ~/.n8n/

# Which database? (look for DB_TYPE, DB_POSTGRESDB_*)
docker exec $(docker ps -qf name=n8n) env 2>/dev/null | grep -iE '^(DB_|N8N_|EXECUTIONS_)'
env | grep -iE '^(DB_|N8N_|EXECUTIONS_)'
cat ~/.n8n/.env 2>/dev/null
grep -riE 'DB_TYPE|POSTGRESDB|EXECUTIONS_DATA' ~/docker-compose.yml /opt/n8n/docker-compose.yml 2>/dev/null

# SQLite file + size (default when DB_TYPE is unset)
ls -lh ~/.n8n/database.sqlite 2>/dev/null
docker exec $(docker ps -qf name=n8n) ls -lh /home/node/.n8n/database.sqlite 2>/dev/null
```

**Report back:** Docker vs native, and SQLite path or Postgres host/db name.

---

## Set your DB shortcut

Pick ONE of these and use it for every query below.

```bash
# SQLite, native install
alias n8ndb='sqlite3 -header -column ~/.n8n/database.sqlite'

# SQLite, inside Docker  (-i so stdin SQL reaches it; read-only)
n8ndb() { docker exec -i $(docker ps -qf name=n8n) sqlite3 -header -column \
  "file:/home/node/.n8n/database.sqlite?mode=ro" "$@"; }

# Postgres  (set host/user/db to what Step 1 found)
n8ndb() { PGPASSWORD="$PGPASS" psql -h localhost -U n8n -d n8n -c "$@"; }
```

> SQLite note: use `mode=ro` where possible so the file cannot be modified.
> Do **not** run `VACUUM`, `PRAGMA optimize`, or anything that writes.

---

## Step 2 — Data retention (STOP GATE)

If June 2026 executions are gone, nothing below will work.

```bash
# Oldest and newest execution still stored, plus total count
n8ndb "SELECT MIN(startedAt) AS oldest, MAX(startedAt) AS newest, COUNT(*) AS total
       FROM execution_entity;"

# How many rows fall inside the cost window?
n8ndb "SELECT COUNT(*) FROM execution_entity
       WHERE startedAt >= '2026-05-25' AND startedAt < '2026-07-11';"

# Month-by-month coverage — shows exactly where pruning cut off
n8ndb "SELECT substr(startedAt,1,7) AS month, COUNT(*) AS executions
       FROM execution_entity GROUP BY 1 ORDER BY 1;"
```

Postgres variant for the month rollup:

```sql
SELECT to_char("startedAt",'YYYY-MM') AS month, COUNT(*)
FROM execution_entity GROUP BY 1 ORDER BY 1;
```

Then check whether pruning is active:

```bash
docker exec $(docker ps -qf name=n8n) env | grep -i EXECUTIONS_DATA
env | grep -i EXECUTIONS_DATA
```

Relevant settings:

| Variable | Meaning |
|---|---|
| `EXECUTIONS_DATA_PRUNE` | `true` = pruning on |
| `EXECUTIONS_DATA_MAX_AGE` | Age limit in **hours** (default 336 = 14 days) |
| `EXECUTIONS_DATA_PRUNE_MAX_COUNT` | Row cap (default 10000) |

**Decision:** if the June 2026 count is zero, report that and stop. Default
n8n pruning keeps only 14 days, so this is the likely outcome — say so
rather than working around it.

---

## Step 3 — Per-workflow execution stats (2026-05-25 to 2026-07-10)

SQLite:

```sql
SELECT
  w.name                                             AS workflow,
  e."workflowId"                                     AS id,
  COUNT(*)                                           AS total,
  SUM(CASE WHEN e.status='success' THEN 1 ELSE 0 END) AS ok,
  SUM(CASE WHEN e.status IN ('error','crashed') THEN 1 ELSE 0 END) AS failed,
  ROUND(100.0 * SUM(CASE WHEN e.status IN ('error','crashed') THEN 1 ELSE 0 END)
        / COUNT(*), 1)                               AS error_pct,
  ROUND(AVG((julianday(e."stoppedAt") - julianday(e."startedAt")) * 86400.0), 1) AS avg_sec,
  ROUND(SUM((julianday(e."stoppedAt") - julianday(e."startedAt")) * 86400.0), 0) AS total_sec,
  MIN(e."startedAt")                                 AS first_run,
  MAX(e."startedAt")                                 AS last_run
FROM execution_entity e
LEFT JOIN workflow_entity w ON w.id = e."workflowId"
WHERE e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
GROUP BY e."workflowId", w.name
ORDER BY total DESC;
```

Postgres — same query, but swap the two duration lines for:

```sql
  ROUND(AVG(EXTRACT(EPOCH FROM (e."stoppedAt" - e."startedAt")))::numeric, 1) AS avg_sec,
  ROUND(SUM(EXTRACT(EPOCH FROM (e."stoppedAt" - e."startedAt")))::numeric, 0) AS total_sec,
```

> If `status` does not exist (n8n older than 1.x), use
> `finished = 1` for success and `finished = 0` for failure instead.

---

## Step 4 — Retry patterns

**4a. Explicit retries** — n8n records these in `retryOf`:

```sql
SELECT w.name, e."workflowId", COUNT(*) AS retry_count,
       COUNT(DISTINCT e."retryOf") AS distinct_originals
FROM execution_entity e
LEFT JOIN workflow_entity w ON w.id = e."workflowId"
WHERE e."retryOf" IS NOT NULL
  AND e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
GROUP BY 1,2 ORDER BY retry_count DESC;
```

**4b. Worst 24-hour burst per workflow** — catches loop storms that are not
tagged as retries (this is what a 167-in-24h workflow looks like):

```sql
SELECT w.name, e."workflowId", substr(e."startedAt",1,10) AS day,
       COUNT(*) AS runs,
       SUM(CASE WHEN e.status IN ('error','crashed') THEN 1 ELSE 0 END) AS failed
FROM execution_entity e
LEFT JOIN workflow_entity w ON w.id = e."workflowId"
WHERE e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
GROUP BY 1,2,3
HAVING runs > 50
ORDER BY runs DESC LIMIT 40;
```

**4c. Tight failure clusters** — failures per hour, flagging hammering:

```sql
SELECT w.name, substr(e."startedAt",1,13) AS hour, COUNT(*) AS failures
FROM execution_entity e
LEFT JOIN workflow_entity w ON w.id = e."workflowId"
WHERE e.status IN ('error','crashed')
  AND e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
GROUP BY 1,2 HAVING failures >= 5
ORDER BY failures DESC LIMIT 40;
```

**4d. The named suspects** — A220-ESCALATION, A-REPAIR, A094:

```sql
SELECT w.name, e."workflowId", e.id, e.status, e."retryOf",
       e."startedAt", e."stoppedAt"
FROM execution_entity e
JOIN workflow_entity w ON w.id = e."workflowId"
WHERE (w.name LIKE '%A220%' OR w.name LIKE '%REPAIR%' OR w.name LIKE '%A094%')
  AND e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
ORDER BY w.name, e."startedAt";
```

---

## Step 5 — Which workflows call Bedrock

```sql
SELECT id, name, active,
       CASE WHEN nodes LIKE '%claude-sonnet-4-5%' THEN 'sonnet-4.5' ELSE '' END AS sonnet,
       CASE WHEN nodes LIKE '%claude-haiku-4-5%'  THEN 'haiku-4.5'  ELSE '' END AS haiku
FROM workflow_entity
WHERE nodes LIKE '%edrock%'
   OR nodes LIKE '%hermes-bedrock%'
   OR nodes LIKE '%claude-sonnet-4-5%'
   OR nodes LIKE '%claude-haiku-4-5%'
ORDER BY name;
```

Cross-check the credential by ID rather than by name:

```sql
SELECT id, name, type FROM credentials_entity WHERE name LIKE '%bedrock%' OR type LIKE '%ws%';
-- then, with the id from above:
SELECT id, name FROM workflow_entity WHERE nodes LIKE '%<CREDENTIAL_ID>%';
```

Join Step 5 against Step 3 — the overlap between "calls Bedrock" and "ran
hundreds of times" is the cost driver.

---

## Step 6 — Oversized prompts and caching

Dump the Bedrock workflows to files so they can be read without touching
the database further. Replace the IDs with those from Step 5:

```bash
mkdir -p ~/n8n-audit && cd ~/n8n-audit
for id in WF_ID_1 WF_ID_2 WF_ID_3; do
  n8ndb "SELECT nodes FROM workflow_entity WHERE id='$id';" > "wf-$id.json"
done
ls -lhS ~/n8n-audit/    # biggest definitions first
```

Then look for the expensive patterns:

```bash
cd ~/n8n-audit
# Whole-transcript interpolation into a prompt
grep -oE '\{\{[^}]{0,160}\}\}' *.json | grep -iE 'transcript|sentences|full_?text|body|context|history|summary' | sort -u

# Prompt caching — absence of any hit means every call pays full input price
grep -io 'cache_control\|cachePoint\|ephemeral\|promptCache' *.json | sort | uniq -c

# Retry settings on the model node: these multiply the prompt cost
grep -o '"retryOnFail":[^,]*\|"maxTries":[^,]*\|"waitBetweenTries":[^,]*\|"alwaysOutputData":[^,]*' *.json | sort | uniq -c
```

Optional, only if execution data is still stored — measures the actual
payload size that was sent on each run:

```sql
SELECT e."workflowId", COUNT(*) AS runs,
       ROUND(AVG(LENGTH(d.data))/1024.0, 1) AS avg_kb,
       ROUND(MAX(LENGTH(d.data))/1024.0, 1) AS max_kb
FROM execution_data d
JOIN execution_entity e ON e.id = d."executionId"
WHERE e."startedAt" >= '2026-05-25' AND e."startedAt" < '2026-07-11'
GROUP BY 1 ORDER BY avg_kb DESC LIMIT 20;
```

**What to flag:**

- A full transcript or long context block interpolated straight into the
  model node's prompt.
- `retryOnFail: true` with `maxTries` of 3 or more on a Bedrock node — each
  attempt re-sends the entire prompt at full input price.
- No `cache_control` / cachePoint anywhere, so no prompt caching discount.
- A large static preamble placed *after* the variable content, which defeats
  caching even if it were enabled.

That combination — big prompt, no caching, retries on failure, high failure
rate — is exactly the shape of a ~90%-input-token bill.

---

## Safety

Nothing above modifies state. Specifically **do not** run: `DELETE`,
`UPDATE`, `INSERT`, `DROP`, `VACUUM`, `n8n execute`, `n8n update:workflow`,
or any workflow activate/deactivate command. Investigation first; changes
only after the findings are reviewed.
