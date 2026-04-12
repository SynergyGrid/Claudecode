# Plan: Reduce Duplicate Health-Check Alerts by 80% (TMG)

## Goal

The Jarvez bot sends "SG1/SG2 alive — A208" alerts to the Telegram Ops
channel every 15 minutes — 96 per day. Most are identical "alive" messages.
Reduce alert volume by 80% while keeping failure detection fast.

## Constraints

- **Do NOT slow down health checks.** Keep polling every 15 minutes.
- **Do NOT suppress failure alerts.** Any down status must alert immediately.
- Only suppress repeated *identical-status* "alive" messages.

---

## Step 1 — Locate the alert-sending code

Search the TMG codebase for the function or module that sends the Telegram
message. Look for:

```
grep -r "SG1/SG2 alive"
grep -r "sendMessage"           # Telegram API call
grep -r "api.telegram.org"
grep -r "A208"
grep -r "alive"
```

Identify:
- The function that formats and sends the alert (e.g. `send_alert`,
  `notify_ops`, or inline `requests.post` / `UrlFetchApp.fetch`).
- The scheduler or trigger that invokes it (cron, APScheduler,
  `setInterval`, Apps Script trigger, etc.).
- Where the current status is determined (the health-check logic).

## Step 2 — Add state tracking

The system needs to remember the **previous status** and **when the last
alert was sent** so it can decide whether to suppress.

### If the bot uses a database / Redis:
```
last_alert_state  TEXT     -- "alive" or "down"
last_alert_ts     INTEGER  -- epoch ms of last sent alert
```

### If the bot is stateless (script / lambda):
Use a lightweight persistence mechanism available in the runtime:
- **Google Apps Script** → `PropertiesService.getScriptProperties()`
- **Python** → small JSON file, SQLite, or env-level cache
- **Node.js** → JSON file or Redis

Store two values:
| Key              | Description                        |
|------------------|------------------------------------|
| `last_state`     | Previous check result: alive/down  |
| `last_sent_ts`   | Unix-ms timestamp of last sent msg |

## Step 3 — Add suppression logic

Wrap the existing send call with this decision tree:

```
on each 15-min check:
    current_state = run_health_check()
    prev_state    = read("last_state")
    last_sent     = read("last_sent_ts")
    minutes_since = (now - last_sent) / 60000

    if current_state != prev_state:
        # Status CHANGED — always send immediately
        send_alert(current_state)
        write("last_sent_ts", now)

    elif current_state == "down":
        # Still down — keep alerting every check
        send_alert(current_state)
        write("last_sent_ts", now)

    elif minutes_since >= 75:
        # Still alive, but 75+ min since last alert — send periodic confirmation
        send_alert(current_state)
        write("last_sent_ts", now)

    # else: still alive, recently sent → suppress (this is the 80% reduction)

    write("last_state", current_state)
```

**Why 75 minutes?** Current interval is 15 min. Sending every 75 min means
1 alert per 5 checks → 80% fewer messages. Adjust by changing the `75`
constant.

## Step 4 — Update the alert message format (optional)

Add context so Ops can distinguish periodic confirmations from
status-change alerts:

| Scenario        | Message example                                                |
|-----------------|----------------------------------------------------------------|
| Status changed  | `🛑 SG1/SG2 down — A208 ran at 2026-04-12 16:30 UTC`         |
| Recovered       | `✅ SG1/SG2 alive — A208 ran at … ℹ️ System recovered.`       |
| Periodic alive  | `✅ SG1/SG2 alive — A208 ran at …` (same as today)            |
| Still down      | `🛑 SG1/SG2 down — A208 ran at … ⚠️ Still down.`             |

## Step 5 — Add a daily summary (optional)

Create a once-per-day function that posts to Ops:

```
📊 Daily Summary — A208
Checks: 96 | Failures: 0 | Uptime: 100.0%
```

This replaces the need for constant "alive" messages as proof of uptime.

## Step 6 — Test

1. **Unit test the suppression logic** — mock the clock and state store,
   verify:
   - First check always sends (no previous state).
   - Consecutive "alive" checks within 75 min are suppressed.
   - The 6th consecutive "alive" check (at 75 min) sends.
   - Any "down" check sends immediately regardless of timing.
   - A "down → alive" transition sends immediately.

2. **Integration test** — run the bot with a shortened interval (e.g. 1 min
   alive threshold) against a test Telegram chat and verify message cadence.

3. **Rollout** — deploy, watch the Ops channel for one hour, confirm:
   - Only ~1 alive alert instead of 4.
   - Simulated failure (kill a health endpoint) still alerts within 15 min.

## Expected outcome

| Metric              | Before       | After               |
|----------------------|-------------|----------------------|
| Check frequency      | 15 min      | 15 min (unchanged)   |
| Alive alerts / day   | ~96         | ~19                  |
| Failure detection    | 15 min      | 15 min (unchanged)   |
| Alert reduction      | —           | **80%**              |

## Reference implementation

See `monitor-alerts.gs` and `alert-config.json` in the Claudecode repo
(`claude/reduce-duplicate-alerts-FKQSv` branch) for a complete Google Apps
Script reference implementation of this logic.
