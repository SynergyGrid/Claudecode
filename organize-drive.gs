/**
 * Google Drive File Organization Script — COMPREHENSIVE (v2 FIXED)
 *
 * This script scans ALL files in My Drive root and uses
 * pattern-matching rules to move them into the correct folders.
 *
 * How to run:
 * 1. Go to https://script.google.com
 * 2. Create a new project (or replace existing script)
 * 3. Paste this entire script
 * 4. Click Run -> select "previewOrganization" first
 * 5. Authorize when prompted (it needs Drive access)
 * 6. Check the Execution Log for results
 * 7. If preview looks good, run "organizeAllFiles"
 *
 * If you have more than ~500 files at root, Apps Script may time out (6 min).
 * In that case, run "organizeAllFilesBatched" which processes in batches
 * using time-based triggers.
 */


// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION — Corrected to match EXACT folder names in your Drive
// ═══════════════════════════════════════════════════════════════════════

var FOLDER_CONFIG = {
  // Top-level folders (exact names as they appear in your Drive)
  CONSULTING:       "_Consulting",
  ACCOUNTING:       "Accounting",
  ADMIN_OPS:        "Admin Operations",       // HAS A SPACE
  AI:               "AI",
  AUTOMATION:       "Automation Folder",
  SG_TEAM_MEETING:  "SG Team Meeting",

  // Subfolders under Accounting
  BILLING:          "Billing & Invoices",
  FINANCIAL_DOCS:   "Financial Documents",
  TAX_DOCS:         "Tax Documents",
  INSURANCE:        "BiBerk Insurance",

  // Subfolders under Admin Operations
  CALL_TRANSCRIPTS: "Call Transcription",
  SG_TEAM_DOCS:     "SG Team Documents",
  RFP:              "RFP's",                  // HAS APOSTROPHE
  PRESENTATIONS:    "Presentations",
  CONTACTS:         "Contacts",
  HR:               "HR",
  COMPANY_PROJECTS: "Comapny Projects",       // TYPO IN ORIGINAL FOLDER NAME
  EVENTS:           "Events, Conference, Speaking Engagement Documents",

  // Subfolders under _Consulting
  FIREFLIES:        "(GF) Fireflies Meetings",
  ACTIVE_PROJECTS:  "Active Projects",
  NDA:              "NDA",

  // Subfolders under SG Team Meeting
  ADA:              "Ada",
  SG_INTERVIEW:     "SG Interview",

  // GemmComm folder tree
  GEMMCOMM:         "GemmComm(Khalid Malik)",
  HECE_GRANT:       "HECE Grant",
};


// ═══════════════════════════════════════════════════════════════════════
// CLASSIFICATION RULES — Order matters! First match wins.
// ═══════════════════════════════════════════════════════════════════════

function getRules_() {
  return [

    // ── 1. TRANSCRIPTS (Fireflies .txt files) ────────────────────────
    {
      name: "Fireflies transcript",
      match: function(f) {
        var n = f.getName();
        return n.indexOf("-transcript-") !== -1 && n.match(/-\d{4}-\d{2}-\d{2}T/);
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.CALL_TRANSCRIPTS]
    },

    // ── 2. DATED MEETING NOTES (Google Docs with | separator) ────────
    {
      name: "Dated meeting note (| separator)",
      match: function(f) {
        var n = f.getName();
        return n.indexOf(" | ") !== -1 && f.getMimeType() === "application/vnd.google-apps.document";
      },
      destination: [FOLDER_CONFIG.SG_TEAM_MEETING]
    },

    // ── 3. CAPITAL ONE / CREDIT CARD STATEMENTS ──────────────────────
    {
      name: "Credit card statement",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return (n.indexOf("capital one") !== -1 || n.indexOf("capitalone") !== -1 || n.indexOf("capone") !== -1)
               && (n.indexOf(".csv") !== -1 || n.indexOf("credit card") !== -1 || n.indexOf("quicksilver") !== -1 || n.indexOf("statement") !== -1);
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.BILLING]
    },

    // ── 4. ENERGY USAGE REPORTS ──────────────────────────────────────
    {
      name: "Energy usage report",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("energy usage") !== -1 || n.indexOf("energy-usage") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.BILLING]
    },

    // ── 5. BUDGET FILES ──────────────────────────────────────────────
    {
      name: "Budget document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("budget") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.FINANCIAL_DOCS]
    },

    // ── 6. INVOICES ──────────────────────────────────────────────────
    {
      name: "Invoice",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("invoice") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.BILLING]
    },

    // ── 7. BILLING / MONTHLY BILLING ─────────────────────────────────
    {
      name: "Billing document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("billing") !== -1 || n.indexOf("expense") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.BILLING]
    },

    // ── 8. TAX DOCUMENTS ─────────────────────────────────────────────
    {
      name: "Tax document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("tax") !== -1 || n.indexOf("w-9") !== -1 || n.indexOf("w9") !== -1
               || n.indexOf("1099") !== -1 || n.indexOf("w-2") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.TAX_DOCS]
    },

    // ── 9. INSURANCE ─────────────────────────────────────────────────
    {
      name: "Insurance document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("insurance") !== -1 || n.indexOf("biberk") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.INSURANCE]
    },

    // ── 10. MSA / CONTRACTS / SIGNED AGREEMENTS ──────────────────────
    {
      name: "Contract / MSA / Agreement",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("msa") !== -1 || n.indexOf("signed") !== -1
               || n.indexOf("addendum") !== -1 || n.indexOf("partnership") !== -1
               || n.indexOf("agreement") !== -1 || n.indexOf("contract") !== -1
               || n.indexOf("fully executed") !== -1 || n.indexOf("amendment") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 11. PROPOSALS / RFPs ─────────────────────────────────────────
    {
      name: "Proposal / RFP",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("proposal") !== -1 || n.indexOf("rfp") !== -1
               || n.indexOf("rfq") !== -1 || n.indexOf("solicitation") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.RFP]
    },

    // ── 12. RATE SCHEDULES ───────────────────────────────────────────
    {
      name: "Rate schedule",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("rate schedule") !== -1 || n.indexOf("rate-schedule") !== -1
               || n.indexOf("pricing") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.FINANCIAL_DOCS]
    },

    // ── 13. COURSE MATERIALS (VPP, Microgrid courses, CBCS) ──────────
    // NOTE: "Microgrid modules" is a SHARED folder — can't move files there.
    // Course materials go to Admin Operations / SG Team Documents instead.
    {
      name: "Course material",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return (n.indexOf("course") !== -1 && (n.indexOf("vpp") !== -1 || n.indexOf("virtual power") !== -1
                || n.indexOf("microgrid") !== -1 || n.indexOf("module") !== -1
                || n.indexOf("tracker") !== -1 || n.indexOf("build") !== -1
                || n.indexOf("community") !== -1))
               || n.indexOf("cbcs") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 14. SOPs (Standard Operating Procedures) ─────────────────────
    {
      name: "SOP document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("sop") !== -1 || n.indexOf("(sop)") !== -1;
      },
      destination: [FOLDER_CONFIG.AUTOMATION]
    },

    // ── 15. AUTOMATION SCRIPTS (A0XX codes, automation, pinecone) ────
    {
      name: "Automation document",
      match: function(f) {
        var n = f.getName();
        return n.match(/^A\d{3}/i) !== null
               || n.toLowerCase().indexOf("automation") !== -1
               || n.toLowerCase().indexOf("pinecone") !== -1;
      },
      destination: [FOLDER_CONFIG.AUTOMATION]
    },

    // ── 16. ADA-RELATED FILES ────────────────────────────────────────
    {
      name: "Ada document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("ada") !== -1 && (n.indexOf("agenda") !== -1 || n.indexOf("unitycloud") !== -1);
      },
      destination: [FOLDER_CONFIG.SG_TEAM_MEETING, FOLDER_CONFIG.ADA]
    },

    // ── 17. MEETING SUMMARIES / MEETING ITINERARY ────────────────────
    {
      name: "Meeting summary",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("meeting summary") !== -1 || n.indexOf("meeting-summary") !== -1
               || n.indexOf("meeting notes") !== -1 || n.indexOf("meeting-notes") !== -1
               || n.indexOf("meeting itinerary") !== -1 || n.indexOf("daily meetings") !== -1;
      },
      destination: [FOLDER_CONFIG.SG_TEAM_MEETING]
    },

    // ── 18. PRESENTATION FILES ───────────────────────────────────────
    {
      name: "Presentation",
      match: function(f) {
        var n = f.getName().toLowerCase();
        var mime = f.getMimeType();
        return mime === "application/vnd.google-apps.presentation"
               || n.indexOf(".pptx") !== -1 || n.indexOf(".ppt") !== -1
               || n.indexOf("presentation") !== -1 || n.indexOf("slide") !== -1
               || n.indexOf("deck") !== -1 || n.indexOf("canvaready") !== -1
               || n.indexOf("test draft") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.PRESENTATIONS]
    },

    // ── 19. TEMPLATES ────────────────────────────────────────────────
    {
      name: "Template",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("template") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 20. FY25 RESILIENT MARYLAND / HECE GRANT FILES ──────────────
    // Must come BEFORE general agenda rule
    {
      name: "HECE Grant / FY25 Resilient Maryland",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("fy25 resilient") !== -1 || n.indexOf("resilient maryland") !== -1;
      },
      destination: [FOLDER_CONFIG.GEMMCOMM, FOLDER_CONFIG.HECE_GRANT]
    },

    // ── 21. AGENDA / MEETING AGENDA FILES ────────────────────────────
    // Must come BEFORE NDA rule because "agenda" contains "nda" as substring!
    {
      name: "Meeting agenda",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("agenda") !== -1 || n.indexOf("bimonthly meeting") !== -1;
      },
      destination: [FOLDER_CONFIG.SG_TEAM_MEETING]
    },

    // ── 21. NDA FILES ────────────────────────────────────────────────
    // Uses word-boundary regex to avoid matching "agenda", "calendar", etc.
    {
      name: "NDA",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.match(/\bnda\b/) !== null || n.indexOf("non-disclosure") !== -1
               || n.indexOf("non disclosure") !== -1 || n.indexOf("confidentiality") !== -1
               || n.indexOf("mutual nda") !== -1;
      },
      destination: [FOLDER_CONFIG.CONSULTING, FOLDER_CONFIG.NDA]
    },

    // ── 21. RESUME / HR FILES ────────────────────────────────────────
    {
      name: "HR document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("resume") !== -1 || n.indexOf("cv ") !== -1
               || n.indexOf("job description") !== -1 || n.indexOf("offer letter") !== -1
               || n.indexOf("interview") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.HR]
    },

    // ── 22. SYNERGY GRID BUSINESS DOCS ───────────────────────────────
    // PE filings, registration, blockers, development plans
    {
      name: "SynergyGrid business doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return (n.indexOf("synergy") !== -1 || n.indexOf("synergygrid") !== -1 || n.indexOf("synergrid") !== -1)
               && (n.indexOf("pe") !== -1 || n.indexOf("filing") !== -1
                   || n.indexOf("registration") !== -1 || n.indexOf("certificate") !== -1
                   || n.indexOf("blocker") !== -1);
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 23. TICKET / RECEIPT FILES ───────────────────────────────────
    {
      name: "Ticket / Receipt",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("ticket") !== -1 || n.indexOf("receipt") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS]
    },

    // ── 24. AI-RELATED DOCS ──────────────────────────────────────────
    {
      name: "AI document",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("chatgpt") !== -1 || n.indexOf("openai") !== -1
               || n.indexOf("claude") !== -1 || n.indexOf("llm") !== -1
               || n.indexOf("gpt") !== -1 || n.indexOf("machine learning") !== -1;
      },
      destination: [FOLDER_CONFIG.AI]
    },

    // ── 25. GREENFLO / PARTNER DOCS ──────────────────────────────────
    {
      name: "GreenFlo / Partner doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("greenflo") !== -1 || n.indexOf("green-flo") !== -1;
      },
      destination: [FOLDER_CONFIG.CONSULTING, FOLDER_CONFIG.FIREFLIES]
    },

    // ── 26. SOFTWARE / PLATFORM DOCS (PRD, Architecture, etc.) ───────
    {
      name: "Software / Platform doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("prd") !== -1 || n.indexOf("architecture") !== -1
               || n.indexOf("development plan") !== -1 || n.indexOf("software outline") !== -1
               || n.indexOf("code architecture") !== -1 || n.indexOf("platform") !== -1
               || n.indexOf("synergenius") !== -1 || n.indexOf("senor genius") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.COMPANY_PROJECTS]
    },

    // ── 27. TRIBAL / COMMUNITY DOCS ──────────────────────────────────
    {
      name: "Tribal / Community doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("tribal") !== -1 || n.indexOf("community benefit") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 28. EVENTS / CONFERENCE DOCS ─────────────────────────────────
    {
      name: "Events / Conference doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("conference") !== -1 || n.indexOf("speaking") !== -1
               || n.indexOf("event") !== -1 || n.indexOf("summit") !== -1
               || n.indexOf("webinar") !== -1 || n.indexOf("noaa") !== -1
               || n.indexOf("fy25 resilient") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.EVENTS]
    },

    // ── 29. LBNL / LAB DOCS ─────────────────────────────────────────
    {
      name: "LBNL / Lab doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("lbnl") !== -1 || n.indexOf("lawrence berkeley") !== -1;
      },
      destination: [FOLDER_CONFIG.ACCOUNTING, FOLDER_CONFIG.BILLING]
    },

    // ── 30. SYNERGY GRID GENERAL (catch-all for remaining SG files) ──
    {
      name: "SynergyGrid general doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("synergy grid") !== -1 || n.indexOf("synergygrid") !== -1
               || n.indexOf("synergy-grid") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 31. CONTRACTS CONTEXT / LEGAL ────────────────────────────────
    {
      name: "Legal / Contracts doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("contracts context") !== -1 || n.indexOf("legal") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 32. MICROGRID (standalone keyword — not in a course context) ─
    {
      name: "Microgrid doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("microgrid") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },

    // ── 33. VPP DOCUMENTS ────────────────────────────────────────────
    {
      name: "VPP doc",
      match: function(f) {
        var n = f.getName().toLowerCase();
        return n.indexOf("vpp") !== -1 || n.indexOf("virtual power") !== -1;
      },
      destination: [FOLDER_CONFIG.ADMIN_OPS, FOLDER_CONFIG.SG_TEAM_DOCS]
    },
  ];
}


// ═══════════════════════════════════════════════════════════════════════
// RENAME FILES (from previous strategy — run once)
// ═══════════════════════════════════════════════════════════════════════

function getRenames_() {
  return [
    { current: "2481_Capital One QuickSilver.csv", renamed: "2481_CapitalOne-QuickSilver_Statement.csv" },
    { current: "2481_Capital One QuickSilver (1).csv", renamed: "2481_CapitalOne-QuickSilver_Statement_v2.csv" },
    { current: "4250_Capital One Credit Card.csv", renamed: "4250_CapitalOne_Statement.csv" },
    { current: "4250_Capital One Credit Card (1).csv", renamed: "4250_CapitalOne_Statement_v2.csv" },
    { current: "4250_Capital One Credit Card (2).csv", renamed: "4250_CapitalOne_Statement_v3.csv" },
    { current: "8798_CapOne Credit Card.csv", renamed: "8798_CapitalOne_Statement.csv" },
    { current: "8798_CapOne Credit Card (1).csv", renamed: "8798_CapitalOne_Statement_v2.csv" },
    { current: "12 months energy usage.xlsx", renamed: "12-Month-Energy-Usage_Report.xlsx" },
    { current: "Budget_11.5.2025", renamed: "Budget_2025-11-05" },
    { current: "Budget_11.5.2025 (Math Checked 2-12-26)", renamed: "Budget_2025-11-05_Verified-2026-02-12" },
    { current: "Budget_11.5.2025 (Math Checked 2-12-26).xlsx", renamed: "Budget_2025-11-05_Verified-2026-02-12.xlsx" },
    { current: "7857716 Synergygrid (PE).pdf", renamed: "7857716_SynergyGrid-PE.pdf" },
    { current: "1980551217005-14137383053-ticket.pdf", renamed: "Ticket_1980551217005-14137383053.pdf" },
    { current: "A024A (SOP) Extract Text And Logging", renamed: "A024-A_SOP_Extract-Text-and-Logging" },
    { current: "A024-B (SOP) Google Sheet to Pinecone", renamed: "A024-B_SOP_GoogleSheet-to-Pinecone" },
    { current: "A024B (SOP) Google Sheet to Pinecone", renamed: "A024-B_SOP_GoogleSheet-to-Pinecone" },
    { current: "A092 Automation List to Pinecone", renamed: "A092_Automation-List-to-Pinecone" },
    { current: "Agenda creation SOP", renamed: "SOP_Agenda-Creation" },
    { current: "Ada's UnityCloud Agenda", renamed: "Ada_UnityCloud-Agenda" },
    { current: "A043 Meeting Summary", renamed: "A043_Meeting-Summary" },
  ];
}


// ═══════════════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * DRY RUN — Shows what would happen without moving anything.
 * Run this first to verify the categorization looks correct!
 */
function previewOrganization() {
  runOrganization_(true);
}

/**
 * LIVE RUN — Actually renames and moves files.
 * Run previewOrganization() first to verify!
 */
function organizeAllFiles() {
  runOrganization_(false);
}

/**
 * Core logic — scans root-level files and applies rules.
 */
function runOrganization_(dryRun) {
  var log = [];
  var moved = 0;
  var unmatched = 0;
  var renamed = 0;
  var errors = 0;

  log.push("═══════════════════════════════════════════════════════════");
  log.push(dryRun ? "  DRY RUN — No files will be moved" : "  LIVE RUN — Files will be moved");
  log.push("═══════════════════════════════════════════════════════════");
  log.push("");

  // ── Step 1: Rename files ──────────────────────────────────────────
  log.push("── RENAMES ──");
  var renames = getRenames_();
  for (var i = 0; i < renames.length; i++) {
    var r = renames[i];
    var files = DriveApp.getFilesByName(r.current);
    if (files.hasNext()) {
      var file = files.next();
      if (!dryRun) {
        file.setName(r.renamed);
      }
      log.push((dryRun ? "[PREVIEW] " : "") + "RENAMED: " + r.current + " -> " + r.renamed);
      renamed++;
    }
  }
  log.push("Renames processed: " + renamed);
  log.push("");

  // ── Step 2: Get all files in root of My Drive ─────────────────────
  log.push("── SCANNING ROOT FILES ──");
  var root = DriveApp.getRootFolder();
  var rootFiles = root.getFiles();
  var rules = getRules_();
  var folderCache = {};
  var unmatchedFiles = [];

  while (rootFiles.hasNext()) {
    var file = rootFiles.next();
    var fileName = file.getName();
    var matchedRule = null;

    // Skip Google Apps Script projects
    if (file.getMimeType() === "application/vnd.google-apps.script") {
      continue;
    }

    // Try each rule in order — first match wins
    for (var r = 0; r < rules.length; r++) {
      try {
        if (rules[r].match(file)) {
          matchedRule = rules[r];
          break;
        }
      } catch (e) {
        log.push("ERROR matching rule '" + rules[r].name + "' on file '" + fileName + "': " + e.message);
        errors++;
      }
    }

    if (matchedRule) {
      var destKey = matchedRule.destination.join("/");
      var destFolder = folderCache[destKey];

      if (!destFolder) {
        destFolder = resolveFolder_(matchedRule.destination);
        if (destFolder) {
          folderCache[destKey] = destFolder;
        }
      }

      if (!destFolder) {
        log.push("FOLDER NOT FOUND: " + destKey + " (for file: " + fileName + ")");
        errors++;
        continue;
      }

      if (!dryRun) {
        try {
          file.moveTo(destFolder);
          log.push("MOVED: " + fileName + " -> " + destKey + "  [" + matchedRule.name + "]");
        } catch (e) {
          log.push("ERROR moving '" + fileName + "': " + e.message);
          errors++;
          continue;
        }
      } else {
        log.push("[PREVIEW] WOULD MOVE: " + fileName + " -> " + destKey + "  [" + matchedRule.name + "]");
      }
      moved++;
    } else {
      unmatchedFiles.push(fileName);
      unmatched++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  log.push("");
  log.push("═══════════════════════════════════════════════════════════");
  log.push("  SUMMARY");
  log.push("═══════════════════════════════════════════════════════════");
  log.push("  Files renamed:    " + renamed);
  log.push("  Files moved:      " + moved);
  log.push("  Files unmatched:  " + unmatched);
  log.push("  Errors:           " + errors);
  log.push("");

  if (unmatchedFiles.length > 0) {
    log.push("── UNMATCHED FILES (still in root) ──");
    log.push("These files didn't match any rule. Review and add rules if needed:");
    for (var u = 0; u < unmatchedFiles.length; u++) {
      log.push("  - " + unmatchedFiles[u]);
    }
  }

  Logger.log(log.join("\n"));

  if (log.length > 20) {
    writeLogToSheet_(log, dryRun);
  }
}


// ═══════════════════════════════════════════════════════════════════════
// BATCHED VERSION — For large drives that may time out
// ═══════════════════════════════════════════════════════════════════════

function organizeAllFilesBatched() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var token = scriptProperties.getProperty("DRIVE_CONTINUATION_TOKEN");
  var batchLog = [];
  var startTime = new Date().getTime();
  var MAX_RUNTIME = 5 * 60 * 1000;
  var rules = getRules_();
  var folderCache = {};
  var moved = 0;

  var rootFiles;
  if (token) {
    rootFiles = DriveApp.continueFileIterator(token);
    batchLog.push("Resuming from previous batch...");
  } else {
    doRenames_();
    var root = DriveApp.getRootFolder();
    rootFiles = root.getFiles();
    batchLog.push("Starting fresh scan of root files...");
  }

  while (rootFiles.hasNext()) {
    if (new Date().getTime() - startTime > MAX_RUNTIME) {
      var continuationToken = rootFiles.getContinuationToken();
      scriptProperties.setProperty("DRIVE_CONTINUATION_TOKEN", continuationToken);
      batchLog.push("TIME LIMIT — Scheduling continuation. Moved " + moved + " files this batch.");
      Logger.log(batchLog.join("\n"));
      ScriptApp.newTrigger("organizeAllFilesBatched")
        .timeBased()
        .after(60 * 1000)
        .create();
      return;
    }

    var file = rootFiles.next();
    var fileName = file.getName();
    if (file.getMimeType() === "application/vnd.google-apps.script") continue;

    for (var r = 0; r < rules.length; r++) {
      try {
        if (rules[r].match(file)) {
          var destKey = rules[r].destination.join("/");
          var destFolder = folderCache[destKey] || resolveFolder_(rules[r].destination);
          if (destFolder) {
            folderCache[destKey] = destFolder;
            file.moveTo(destFolder);
            batchLog.push("MOVED: " + fileName + " -> " + destKey);
            moved++;
          }
          break;
        }
      } catch (e) {
        batchLog.push("ERROR: " + fileName + " — " + e.message);
      }
    }
  }

  scriptProperties.deleteProperty("DRIVE_CONTINUATION_TOKEN");
  deleteTriggers_("organizeAllFilesBatched");
  batchLog.push("COMPLETE! Moved " + moved + " files in this final batch.");
  Logger.log(batchLog.join("\n"));
}


// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Resolves a folder path like ["Accounting", "Billing & Invoices"].
 * Tries exact match first, then startsWith for partial names.
 */
function resolveFolder_(pathArray) {
  var current = DriveApp.getRootFolder();

  for (var i = 0; i < pathArray.length; i++) {
    var targetName = pathArray[i];
    var found = false;

    // First try exact match
    var subFolders = current.getFoldersByName(targetName);
    if (subFolders.hasNext()) {
      current = subFolders.next();
      found = true;
    }

    // If not found, try startsWith (for truncated/partial names)
    if (!found) {
      var allSubs = current.getFolders();
      while (allSubs.hasNext()) {
        var sf = allSubs.next();
        if (sf.getName().indexOf(targetName) === 0) {
          current = sf;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return null;
    }
  }

  return current;
}

function doRenames_() {
  var renames = getRenames_();
  for (var i = 0; i < renames.length; i++) {
    var r = renames[i];
    var files = DriveApp.getFilesByName(r.current);
    if (files.hasNext()) {
      files.next().setName(r.renamed);
    }
  }
}

function writeLogToSheet_(logLines, dryRun) {
  var sheetName = dryRun ? "Drive Organization Preview" : "Drive Organization Log";
  var ss = SpreadsheetApp.create(sheetName + " — " + new Date().toLocaleDateString());
  var sheet = ss.getActiveSheet();
  sheet.setName("Results");
  for (var i = 0; i < logLines.length; i++) {
    sheet.getRange(i + 1, 1).setValue(logLines[i]);
  }
  Logger.log("Log written to spreadsheet: " + ss.getUrl());
}

function deleteTriggers_(functionName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
