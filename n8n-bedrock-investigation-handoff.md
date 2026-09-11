# Handoff: n8n Bedrock Cost Investigation

**From:** remote Claude Code session (cloud container, no Jarvez access)
**To:** a Claude session running on or able to reach the Jarvez host
**Date:** 2026-09-11

---

## Part 1 — Result of this session

### Outcome

**No findings on the cost overrun.** Zero execution records were queried.
The investigation could not start because the n8n instance is unreachable
from this environment.

### What was checked and found

| Check | Command basis | Result |
|---|---|---|
| Host identity | `hostname`, `whoami` | `vm`, root — ephemeral cloud container, not Jarvez |
| Docker | `docker ps` | Binary present, **daemon not running** (`/var/run/docker.sock` missing) |
| Native n8n | `ps aux`, `which n8n`, `ls ~/.n8n` | No process, no binary, no config directory |
| Databases | `find / -name '*.sqlite'` | None on disk. `psql` installed but no n8n connection or DB env vars |
| Tailscale | `which tailscale` | **Not installed** — no path into the Jarvez network |
| SSH | `ls ~/.ssh` | Directory empty, no keys, no config |
| Network | `ip -4 addr` | No route to a private LAN host; outbound is HTTPS-proxy only |
| Env vars | `env \| grep -iE 'DB_\|N8N_\|EXECUTIONS_'` | No matches |
| Repo contents | `ls`, `grep -ril` | 4 files, none n8n-related (see below) |

### Repository contents

`synergygrid/claudecode` holds only:

- `README.md`
- `monitor-alerts.gs`
- `alert-config.json`
- `plan-reduce-alerts-tmg.md`

These do mention "Jarvez" and check ID **A208**, but they are a Google Apps
Script Telegram health-check alerter, unrelated to n8n or Bedrock. No
workflow JSON, no execution export, no database dump anywhere in the repo.

### Actions taken (all read-only)

1. Filesystem and process inspection of this container only
2. Read the four repo files
3. Wrote `n8n-bedrock-investigation-readonly.md`, committed, pushed
4. Opened draft PR #2 and read its status

**Jarvez was never contacted.** No n8n workflow was started, resumed,
executed, activated, or modified. No credential was read. Nothing in this
session could have added to the Bedrock bill.

### Still unanswered — the entire original brief

- Docker vs native, and which database backs it
- Whether June 2026 executions still exist or were pruned
- Per-workflow execution counts, success/failure split, error rates
- Average and total execution duration per workflow
- Retry clustering, and whether A220-ESCALATION / A-REPAIR / A094 are
  actually responsible (still unverified team-chat hearsay)
- Which workflows reference Bedrock nodes or the hermes-bedrock credential
- Whether oversized prompts are sent, and whether prompt caching is enabled

### One inference, not a finding

Default n8n retention is 14 days (`EXECUTIONS_DATA_MAX_AGE=336` hours, plus a
10,000-row cap). The cost window is May 28 to Jul 8, 2026; today is Sep 11,
2026 — roughly three months later. **Unless pruning was disabled or the
limits were raised, that execution history is very likely already deleted.**

If so, steps 2 through 4 of the brief are permanently unanswerable, and the
workflow definitions become the only surviving evidence. Those are never
pruned, and the cost-driving pattern is usually identifiable from the
definition alone: a large prompt, no caching, retries enabled, on a workflow
with a high failure rate.

### Deliverable from this session

`n8n-bedrock-investigation-readonly.md` — a six-step read-only command set
covering the full brief, with SQLite and Postgres variants and a fallback for
pre-1.x schemas lacking the `status` column. **Untested against the real
instance**, so its schema assumptions should be verified as output comes back.

---

## Part 2 — Prompt for the session with Jarvez access

Paste everything below into the Claude session that can reach Jarvez.

---

### TASK

Investigate an AWS Bedrock cost overrun in an n8n instance named **Jarvez**.

**Background:** Between roughly 2026-05-28 and 2026-07-08 this instance called
AWS Bedrock (Claude Sonnet 4.5 and Haiku 4.5) and ran up about **$2,281** in
token charges. About **90% of that was input tokens**, which points at large
prompts being re-sent repeatedly — most likely failing workflows retrying.
The goal is to identify which workflows were responsible.

**Known suspects from team chat, all unverified:**
- `A220-ESCALATION` — reportedly 167 executions in 24 hours, ~60% error rate
- `A-REPAIR`
- `A094`

**Analysis window:** 2026-05-25 to 2026-07-10.

### HARD CONSTRAINTS

- **Read-only.** Do not modify, disable, delete, or create any workflow,
  execution record, or credential.
- **Never run:** `DELETE`, `UPDATE`, `INSERT`, `DROP`, `VACUUM`,
  `PRAGMA optimize`, `n8n execute`, `n8n update:workflow`, or any workflow
  activate/deactivate command.
- **Do not start or resume the n8n instance if it is currently stopped.**
  The owner deliberately powered it off to stop further Bedrock charges.
  Every query below works against the database file directly; a running n8n
  is not required. If the instance is off, read a **copy** of the database
  file rather than the live one.
- Open SQLite read-only where possible: `file:<path>?mode=ro`
- Report findings after each step and wait before continuing. Do not
  propose or apply fixes until the findings have been reviewed.

### PRIOR WORK

A remote Claude session already attempted this and got nowhere — it had no
network path to Jarvez (no Docker daemon, no Tailscale, no SSH keys). It
produced a read-only command set at `n8n-bedrock-investigation-readonly.md`
on branch `claude/n8n-bedrock-cost-investigation-rooylv` of
`SynergyGrid/Claudecode` (draft PR #2). Use it as a starting point, but
verify its schema assumptions against the actual n8n version — they are
untested.

### STEPS

**Step 1 — Locate the installation.** Determine whether n8n runs in Docker or
natively, and identify its database: SQLite file path, or Postgres host and
database name. Check `DB_TYPE` and `DB_POSTGRESDB_*` in the container env,
shell env, `~/.n8n/.env`, and any docker-compose file. Report what you find
before querying anything.

**Step 2 — Data retention. THIS IS A STOP GATE.** Find the oldest execution
record still stored, produce a month-by-month execution count, and determine
whether `EXECUTIONS_DATA_PRUNE`, `EXECUTIONS_DATA_MAX_AGE`, or
`EXECUTIONS_DATA_PRUNE_MAX_COUNT` are set. **If June 2026 data has been
pruned, say so explicitly and skip to steps 5 and 6** — workflow definitions
survive pruning, so prompt-size and retry analysis is still possible even
when execution history is gone. Do not fabricate or estimate execution
counts that no longer exist in the database.

**Step 3 — Per-workflow stats** for 2026-05-25 to 2026-07-10, sorted by total
executions descending:
- Workflow name and ID
- Total executions
- Successful vs failed, and the error rate
- Average and total execution duration
- First and last execution timestamp

n8n 1.x: success is `status='success'`, failure is `status IN ('error','crashed')`.
Older schemas have no `status` column — use `finished = 1` / `finished = 0`.

**Step 4 — Retry patterns.** Flag repeated retries and tight failure clusters:
- Explicit retries: `execution_entity.retryOf IS NOT NULL`, grouped by workflow
- Worst 24-hour burst per workflow (the shape of a 167-runs-in-a-day storm)
- Failures per hour where the count is 5 or more
- Pull the full execution list for the three named suspects and confirm or
  refute the 167-executions / 60%-error claim against real rows

**Step 5 — Which workflows call Bedrock.** Search `workflow_entity.nodes` for
`bedrock`, `hermes-bedrock`, `claude-sonnet-4-5`, `claude-haiku-4-5`. Also
look up the Bedrock credential in `credentials_entity` and search workflow
definitions for its **ID** rather than its name, since nodes reference
credentials by ID. Cross-reference this list against step 3 — the overlap
between "calls Bedrock" and "ran hundreds of times" is the cost driver.

**Step 6 — Oversized prompts and caching.** For each Bedrock-calling
workflow, dump its `nodes` JSON to a file and examine:
- Whether full meeting transcripts or large context blocks are interpolated
  into the model node's prompt (look for `{{ }}` expressions referencing
  transcript, sentences, full_text, body, context, history, summary)
- Whether prompt caching is used at all — grep for `cache_control`,
  `cachePoint`, `ephemeral`. No hits means every call paid full input price.
- `retryOnFail`, `maxTries`, `waitBetweenTries` on the Bedrock nodes — each
  retry re-sends the entire prompt at full input cost
- Whether a large static preamble sits *after* variable content, which
  defeats caching even when enabled
- If `execution_data` rows survive, measure `LENGTH(data)` per workflow to
  get the actual payload size sent on each run

### EXPECTED OUTPUT

A ranked list of workflows by estimated contribution to the $2,281, each with
the evidence behind it: execution count, error rate, prompt size, retry
configuration, and caching status. Where execution history has been pruned,
say clearly which conclusions rest on workflow configuration alone rather
than on observed runs.

Then stop and wait for instructions before changing anything.

---

## Part 3 — If the database needs to come to a remote session instead

With Jarvez powered off, copy the database out and hand it over:

```bash
# SQLite (default)
cp ~/.n8n/database.sqlite /tmp/n8n-audit-copy.sqlite
ls -lh /tmp/n8n-audit-copy.sqlite

# Docker volume, container stopped — find the host path first
docker inspect <container> --format '{{json .Mounts}}'
cp <host_path>/database.sqlite /tmp/n8n-audit-copy.sqlite

# Postgres
pg_dump -h localhost -U n8n -d n8n \
  -t execution_entity -t workflow_entity -t credentials_entity \
  --no-owner > /tmp/n8n-audit.sql
```

A copy is safe to query freely — nothing touches the live instance, and
Jarvez stays off. Strip or ignore `credentials_entity.data`; it is encrypted
and not needed for this analysis.
