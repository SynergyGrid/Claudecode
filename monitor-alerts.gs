/**
 * SynergyGrid Health Check Alert Manager
 *
 * Reduces duplicate Telegram "alive" alerts by ~80% while preserving
 * instant notification on status changes (up->down or down->up).
 *
 * How it works:
 *   - Health checks still run every 15 minutes (detection speed unchanged).
 *   - "Status changed" alerts (e.g. system went DOWN) are sent immediately.
 *   - Repeated "still alive" alerts are suppressed and sent only once
 *     every ALIVE_ALERT_INTERVAL_MINUTES (default 75 min, i.e. 1 in 5).
 *   - A daily summary is posted at DAILY_SUMMARY_HOUR UTC.
 *
 * Setup:
 *   1. Set Script Properties (File > Project properties > Script properties):
 *        TELEGRAM_BOT_TOKEN  – Jarvez bot token
 *        TELEGRAM_CHAT_ID    – Ops group chat ID
 *   2. Create a time-driven trigger to run `runHealthCheck` every 15 minutes.
 *   3. Create a time-driven trigger to run `sendDailySummary` once per day.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

var CONFIG = {
  // How often the health check trigger fires (minutes). Do NOT change this —
  // fast polling keeps detection time low.
  CHECK_INTERVAL_MINUTES: 15,

  // Minimum minutes between repeated "alive" alerts for the SAME status.
  // 75 min = sends 1 out of every 5 checks → 80 % reduction.
  ALIVE_ALERT_INTERVAL_MINUTES: 75,

  // Hour (UTC, 0-23) to post the daily uptime summary.
  DAILY_SUMMARY_HOUR: 8,

  // Systems to monitor — add / remove entries as needed.
  SYSTEMS: [
    { name: 'SG1', endpoint: 'SG1_HEALTH_URL' },
    { name: 'SG2', endpoint: 'SG2_HEALTH_URL' }
  ],

  // Identifier for this check (matches "A208" from the original alerts).
  CHECK_ID: 'A208'
};

// ---------------------------------------------------------------------------
// Main entry point — called by the 15-minute trigger
// ---------------------------------------------------------------------------

function runHealthCheck() {
  var props   = PropertiesService.getScriptProperties();
  var now     = new Date();
  var systems = CONFIG.SYSTEMS;

  var allAlive = true;
  var statusParts = [];

  for (var i = 0; i < systems.length; i++) {
    var alive = checkSystem(systems[i]);
    statusParts.push(systems[i].name);
    if (!alive) allAlive = false;
  }

  var systemLabel  = statusParts.join('/');
  var currentState = allAlive ? 'alive' : 'down';
  var prevState    = props.getProperty('last_state') || '';
  var lastSentStr  = props.getProperty('last_sent_ts') || '0';
  var lastSentTs   = parseInt(lastSentStr, 10);
  var minutesSince = (now.getTime() - lastSentTs) / 60000;

  // Track consecutive check count for daily summary
  var checkCount   = parseInt(props.getProperty('check_count') || '0', 10) + 1;
  var failCount    = parseInt(props.getProperty('fail_count') || '0', 10) + (allAlive ? 0 : 1);
  props.setProperty('check_count', String(checkCount));
  props.setProperty('fail_count', String(failCount));

  // ---- Decision: should we send an alert? ----
  var shouldSend = false;
  var reason     = '';

  if (currentState !== prevState) {
    // Status CHANGED — always send immediately
    shouldSend = true;
    reason = currentState === 'alive' ? 'recovered' : 'status_change';
  } else if (currentState === 'down') {
    // Still down — keep alerting every check so it stays visible
    shouldSend = true;
    reason = 'still_down';
  } else if (minutesSince >= CONFIG.ALIVE_ALERT_INTERVAL_MINUTES) {
    // Still alive, but enough time has passed for a periodic confirmation
    shouldSend = true;
    reason = 'periodic';
  }
  // else: still alive & recently sent → suppress (this is the 80% reduction)

  if (shouldSend) {
    var icon = allAlive ? '\u2705' : '\uD83D\uDED1';
    var ts   = formatUTC(now);
    var msg  = icon + ' ' + systemLabel + ' ' + currentState
             + ' \u2014 ' + CONFIG.CHECK_ID + ' ran at ' + ts;

    if (reason === 'recovered') {
      msg += '\n\u2139\uFE0F System recovered.';
    } else if (reason === 'still_down') {
      msg += '\n\u26A0\uFE0F Still down — investigating.';
    }

    sendTelegram(msg);
    props.setProperty('last_sent_ts', String(now.getTime()));
  }

  // Always update persisted state
  props.setProperty('last_state', currentState);
  props.setProperty('last_check_ts', String(now.getTime()));
}

// ---------------------------------------------------------------------------
// Daily summary — called by a once-per-day trigger
// ---------------------------------------------------------------------------

function sendDailySummary() {
  var props      = PropertiesService.getScriptProperties();
  var checkCount = parseInt(props.getProperty('check_count') || '0', 10);
  var failCount  = parseInt(props.getProperty('fail_count') || '0', 10);
  var uptime     = checkCount > 0
                 ? ((1 - failCount / checkCount) * 100).toFixed(1)
                 : '—';

  var msg = '\uD83D\uDCCA Daily Summary \u2014 ' + CONFIG.CHECK_ID
          + '\nChecks: ' + checkCount
          + ' | Failures: ' + failCount
          + ' | Uptime: ' + uptime + '%';

  sendTelegram(msg);

  // Reset counters for next day
  props.setProperty('check_count', '0');
  props.setProperty('fail_count', '0');
}

// ---------------------------------------------------------------------------
// Health check — replace with your real connectivity test
// ---------------------------------------------------------------------------

function checkSystem(system) {
  try {
    var url = PropertiesService.getScriptProperties().getProperty(system.endpoint);
    if (!url) {
      Logger.log('No endpoint URL configured for ' + system.name);
      return true; // default alive if not configured yet
    }
    var resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
    return resp.getResponseCode() >= 200 && resp.getResponseCode() < 400;
  } catch (e) {
    Logger.log('Check failed for ' + system.name + ': ' + e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Telegram helper
// ---------------------------------------------------------------------------

function sendTelegram(text) {
  var props   = PropertiesService.getScriptProperties();
  var token   = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId  = props.getProperty('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    Logger.log('Telegram credentials not set. Message: ' + text);
    return;
  }

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    }),
    muteHttpExceptions: true
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatUTC(date) {
  return Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd HH:mm') + ' UTC';
}

// ---------------------------------------------------------------------------
// One-time setup helpers (run manually once)
// ---------------------------------------------------------------------------

/** Install the 15-minute health check trigger. */
function installCheckTrigger() {
  ScriptApp.newTrigger('runHealthCheck')
    .timeBased()
    .everyMinutes(CONFIG.CHECK_INTERVAL_MINUTES)
    .create();
  Logger.log('Installed runHealthCheck trigger (every '
    + CONFIG.CHECK_INTERVAL_MINUTES + ' min).');
}

/** Install the daily summary trigger. */
function installDailySummaryTrigger() {
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .atHour(CONFIG.DAILY_SUMMARY_HOUR)
    .everyDays(1)
    .create();
  Logger.log('Installed daily summary trigger at '
    + CONFIG.DAILY_SUMMARY_HOUR + ':00 UTC.');
}

/** Remove all triggers created by this project. */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log('Removed ' + triggers.length + ' trigger(s).');
}
