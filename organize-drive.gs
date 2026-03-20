/**
 * Google Drive File Organization Script
 *
 * How to run:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this entire script
 * 4. Click Run → select "organizeFiles"
 * 5. Authorize when prompted (it needs Drive access)
 * 6. Check the Execution Log for results
 */

function organizeFiles() {
  const results = [];

  // ── Step 1: Rename files ──────────────────────────────────────────────

  const renames = [
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
    { current: "2nd half Oct 2, 2025 | Developing Community Microgrids", renamed: "2025-10-02_Developing-Community-Microgrids_Part-2" },
    { current: "August 7, 2025 | Synergy Grid & Nicole Sitaraman: Microgrid Course & Industry Discussion", renamed: "2025-08-07_Nicole-Sitaraman_Microgrid-Course-Industry-Discussion" },
    { current: "August 12, 2025 | GreenFlo Microgrid Course Content Review", renamed: "2025-08-12_GreenFlo_Microgrid-Course-Content-Review" },
    { current: "August 13, 2025 | Course Content Restructuring Meeting", renamed: "2025-08-13_Course-Content-Restructuring-Meeting" },
    { current: "August 13, 2025 | Synergy Grid & Jamal Lewis Course Content Review", renamed: "2025-08-13_Jamal-Lewis_Course-Content-Review" },
    { current: "August 14, 2025 | Introduction to Microgrids Course Overview", renamed: "2025-08-14_Intro-to-Microgrids-Course-Overview" },
    { current: "A043 Meeting Summary", renamed: "A043_Meeting-Summary" },
    { current: "Ada's UnityCloud Agenda", renamed: "Ada_UnityCloud-Agenda" },
    { current: "Agenda creation SOP", renamed: "SOP_Agenda-Creation" },
    { current: "A024A (SOP) Extract Text And Logging", renamed: "A024-A_SOP_Extract-Text-and-Logging" },
    { current: "A024-B (SOP) Google Sheet to Pinecone", renamed: "A024-B_SOP_GoogleSheet-to-Pinecone" },
    { current: "A092 Automation List to Pinecone", renamed: "A092_Automation-List-to-Pinecone" },
    { current: "7857716 Synergygrid (PE).pdf", renamed: "7857716_SynergyGrid-PE.pdf" },
    { current: "1980551217005-14137383053-ticket.pdf", renamed: "Ticket_1980551217005-14137383053.pdf" },
  ];

  for (const r of renames) {
    const files = DriveApp.getFilesByName(r.current);
    if (files.hasNext()) {
      const file = files.next();
      file.setName(r.renamed);
      results.push("RENAMED: " + r.current + " → " + r.renamed);
    } else {
      results.push("NOT FOUND: " + r.current);
    }
  }

  // ── Step 2: Move files into destination folders ───────────────────────

  const moves = [
    // Credit cards + energy → Accounting / Billing & Invoices
    { file: "2481_CapitalOne-QuickSilver_Statement.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "2481_CapitalOne-QuickSilver_Statement_v2.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "4250_CapitalOne_Statement.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "4250_CapitalOne_Statement_v2.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "4250_CapitalOne_Statement_v3.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "8798_CapitalOne_Statement.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "8798_CapitalOne_Statement_v2.csv", folderPath: ["Accounting", "Billing & Invoices"] },
    { file: "12-Month-Energy-Usage_Report.xlsx", folderPath: ["Accounting", "Billing & Invoices"] },

    // Budgets → Accounting / Financial Documents
    { file: "Budget_2025-11-05", folderPath: ["Accounting"], folderSearch: "Financial Docume" },
    { file: "Budget_2025-11-05_Verified-2026-02-12", folderPath: ["Accounting"], folderSearch: "Financial Docume" },
    { file: "Budget_2025-11-05_Verified-2026-02-12.xlsx", folderPath: ["Accounting"], folderSearch: "Financial Docume" },

    // Meeting notes → SG Team Meeting
    { file: "2025-10-02_Developing-Community-Microgrids_Part-2", folderPath: ["SG Team Meeting"] },
    { file: "2025-08-07_Nicole-Sitaraman_Microgrid-Course-Industry-Discussion", folderPath: ["SG Team Meeting"] },
    { file: "2025-08-12_GreenFlo_Microgrid-Course-Content-Review", folderPath: ["SG Team Meeting"] },
    { file: "2025-08-13_Course-Content-Restructuring-Meeting", folderPath: ["SG Team Meeting"] },
    { file: "2025-08-13_Jamal-Lewis_Course-Content-Review", folderPath: ["SG Team Meeting"] },
    { file: "2025-08-14_Intro-to-Microgrids-Course-Overview", folderPath: ["SG Team Meeting"] },
    { file: "A043_Meeting-Summary", folderPath: ["SG Team Meeting"] },

    // Ada's agenda → SG Team Meeting / Ada
    { file: "Ada_UnityCloud-Agenda", folderPath: ["SG Team Meeting", "Ada"] },

    // Agenda SOP + PE doc → AdminOperations / SG Team Documents
    { file: "SOP_Agenda-Creation", folderPath: ["AdminOperations"], folderSearch: "SG Team Docume" },
    { file: "7857716_SynergyGrid-PE.pdf", folderPath: ["AdminOperations"], folderSearch: "SG Team Docume" },

    // Automation SOPs → Automation Folder
    { file: "A024-A_SOP_Extract-Text-and-Logging", folderPath: ["Automation Folder"] },
    { file: "A024-B_SOP_GoogleSheet-to-Pinecone", folderPath: ["Automation Folder"] },
    { file: "A092_Automation-List-to-Pinecone", folderPath: ["Automation Folder"] },

    // Ticket → AdminOperations
    { file: "Ticket_1980551217005-14137383053.pdf", folderPath: ["AdminOperations"] },
  ];

  for (const m of moves) {
    const files = DriveApp.getFilesByName(m.file);
    if (!files.hasNext()) {
      results.push("MOVE NOT FOUND: " + m.file);
      continue;
    }
    const file = files.next();

    // Navigate to the destination folder
    var destFolder = null;
    if (m.folderSearch) {
      // For truncated folder names, search within the parent
      var parentFolder = findFolder_(m.folderPath[0]);
      if (parentFolder) {
        var subFolders = parentFolder.getFolders();
        while (subFolders.hasNext()) {
          var sf = subFolders.next();
          if (sf.getName().indexOf(m.folderSearch) === 0) {
            destFolder = sf;
            break;
          }
        }
      }
    } else {
      destFolder = navigateToFolder_(m.folderPath);
    }

    if (!destFolder) {
      results.push("FOLDER NOT FOUND: " + m.folderPath.join(" / ") + (m.folderSearch ? " / " + m.folderSearch : ""));
      continue;
    }

    // Move: add to destination, remove from current parent(s)
    destFolder.addFile(file);
    var parents = file.getParents();
    while (parents.hasNext()) {
      var parent = parents.next();
      if (parent.getId() !== destFolder.getId()) {
        parent.removeFile(file);
      }
    }
    results.push("MOVED: " + m.file + " → " + destFolder.getName());
  }

  // ── Step 3: Flag duplicates ───────────────────────────────────────────

  results.push("");
  results.push("── DUPLICATE CHECK ──");

  // Check for duplicate A043 Meeting Summary
  var a043files = DriveApp.getFilesByName("A043 Meeting Summary");
  var a043count = 0;
  while (a043files.hasNext()) {
    a043files.next();
    a043count++;
  }
  if (a043count > 0) {
    results.push("DUPLICATE: Found " + a043count + " remaining file(s) named 'A043 Meeting Summary' — review and delete manually");
  }

  // Check for duplicate budget xlsx
  var budgetFiles = DriveApp.searchFiles("title contains 'Budget_11.5.2025 (Math Checked 2-12-26).xlsx'");
  var budgetCount = 0;
  while (budgetFiles.hasNext()) {
    budgetFiles.next();
    budgetCount++;
  }
  if (budgetCount > 0) {
    results.push("DUPLICATE: Found " + budgetCount + " remaining file(s) matching budget xlsx — review and delete manually");
  }

  // ── Print results ─────────────────────────────────────────────────────

  Logger.log("\n" + results.join("\n"));
  SpreadsheetApp.getUi().alert("Done! Check View → Logs for details.");
}


// ── Helper: find a single folder by name in My Drive ──────────────────

function findFolder_(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return null;
}


// ── Helper: navigate a folder path like ["Accounting", "Billing & Invoices"] ──

function navigateToFolder_(pathArray) {
  var current = DriveApp.getRootFolder();
  for (var i = 0; i < pathArray.length; i++) {
    var found = false;
    var subFolders = current.getFoldersByName(pathArray[i]);
    if (subFolders.hasNext()) {
      current = subFolders.next();
      found = true;
    }
    if (!found) {
      return null;
    }
  }
  return current;
}
