# Google Drive File Organization Strategy

## Current State Analysis

From reviewing the Drive screenshots, the root of "My Drive" contains a mix of file types with inconsistent naming conventions. Files fall into several clear categories that should each have their own folder structure.

---

## Identified File Categories & Proposed Folder Structure

### 1. `Finance/`
Financial statements, credit card records, and budget files.

| Current Name | Proposed Rename | Subfolder |
|---|---|---|
| `2481_Capital One QuickSilver.csv` | `2481_CapitalOne_QuickSilver_Statement.csv` | `Finance/Credit-Cards/CapitalOne-QuickSilver-2481/` |
| `2481_Capital One QuickSilver (1).csv` | `2481_CapitalOne_QuickSilver_Statement_v2.csv` | `Finance/Credit-Cards/CapitalOne-QuickSilver-2481/` |
| `4250_Capital One Credit Card.csv` | `4250_CapitalOne_CreditCard_Statement.csv` | `Finance/Credit-Cards/CapitalOne-4250/` |
| `4250_Capital One Credit Card (1).csv` | `4250_CapitalOne_CreditCard_Statement_v2.csv` | `Finance/Credit-Cards/CapitalOne-4250/` |
| `4250_Capital One Credit Card (2).csv` | `4250_CapitalOne_CreditCard_Statement_v3.csv` | `Finance/Credit-Cards/CapitalOne-4250/` |
| `8798_CapOne Credit Card.csv` | `8798_CapitalOne_CreditCard_Statement.csv` | `Finance/Credit-Cards/CapitalOne-8798/` |
| `8798_CapOne Credit Card (1).csv` | `8798_CapitalOne_CreditCard_Statement_v2.csv` | `Finance/Credit-Cards/CapitalOne-8798/` |
| `12 months energy usage.xlsx` | `12-Month_Energy_Usage_Report.xlsx` | `Finance/Utilities/` |
| `Budget_11.5.2025` (Google Sheet) | `Budget_2025-11-05.gsheet` | `Finance/Budgets/` |
| `Budget_11.5.2025 (Math Checked 2-12-26)` (Google Sheet) | `Budget_2025-11-05_Verified-2026-02-12.gsheet` | `Finance/Budgets/` |
| `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (2 copies) | `Budget_2025-11-05_Verified-2026-02-12.xlsx` | `Finance/Budgets/` |

**Note:** Duplicate `.xlsx` budget files (Feb 17 and Feb 18) should be compared — keep the most recent, archive or delete the older one.

### 2. `SynergyGrid/`
All Synergy Grid company files — meetings, courses, SOPs, and business documents.

#### `SynergyGrid/Meetings/`
| Current Name | Proposed Rename | Subfolder |
|---|---|---|
| `SG Team Meeting` (folder) | `Team-Meetings/` | `SynergyGrid/Meetings/Team-Meetings/` |
| `August 7, 2025 \| Synergy Grid & Nicole Sitaraman...` | `2025-08-07_Nicole-Sitaraman_Microgrid-Course-Discussion.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `August 12, 2025 \| GreenFlo Microgrid Course...` | `2025-08-12_GreenFlo_Microgrid-Course-Review.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `August 13, 2025 \| Course Content Restructuring...` | `2025-08-13_Course-Content-Restructuring.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `August 13, 2025 \| Synergy Grid & Jamal Lewis...` | `2025-08-13_Jamal-Lewis_Course-Content-Review.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `August 14, 2025 \| Introduction to Microgrids...` | `2025-08-14_Intro-Microgrids-Course-Overview.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `2nd half Oct 2, 2025 \| Developing Community Microgrids` | `2025-10-02_Community-Microgrids-Part2.gdoc` | `SynergyGrid/Meetings/Notes/` |
| `A043 Meeting Summary` (Feb 17 copy) | `A043_Meeting-Summary_v1.gdoc` | `SynergyGrid/Meetings/Summaries/` |
| `A043 Meeting Summary` (Feb 18 copy) | `A043_Meeting-Summary_v2.gdoc` | `SynergyGrid/Meetings/Summaries/` |
| `Ada's UnityCloud Agenda` | `UnityCloud_Agenda_Ada.gdoc` | `SynergyGrid/Meetings/Agendas/` |
| `Agenda creation SOP` | `SOP_Agenda-Creation.gdoc` | `SynergyGrid/SOPs/` |

#### `SynergyGrid/Documents/`
| Current Name | Proposed Rename | Subfolder |
|---|---|---|
| `7857716 Synergygrid (PE).pdf` | `SynergyGrid_PE_Doc_7857716.pdf` | `SynergyGrid/Documents/` |

### 3. `Automation/`
SOPs and tools related to automation workflows (Pinecone, text extraction, etc.).

| Current Name | Proposed Rename | Subfolder |
|---|---|---|
| `A024-B (SOP) Google Sheet to Pinecone` | `A024-B_SOP_GoogleSheet-to-Pinecone.gslides` | `Automation/SOPs/` |
| `A024A (SOP) Extract Text And Logging` | `A024-A_SOP_Extract-Text-and-Logging.gslides` | `Automation/SOPs/` |
| `A092 Automation List to Pinecone` | `A092_Automation-List-to-Pinecone.gslides` | `Automation/Workflows/` |

### 4. `Personal/`
Tickets and personal documents.

| Current Name | Proposed Rename | Subfolder |
|---|---|---|
| `1980551217005-14137383053-ticket.pdf` | `Ticket_1980551217005-14137383053.pdf` | `Personal/Tickets/` |

---

## Proposed Folder Tree

```
My Drive/
├── Finance/
│   ├── Budgets/
│   ├── Credit-Cards/
│   │   ├── CapitalOne-QuickSilver-2481/
│   │   ├── CapitalOne-4250/
│   │   └── CapitalOne-8798/
│   └── Utilities/
├── SynergyGrid/
│   ├── Meetings/
│   │   ├── Team-Meetings/        (existing folder moved here)
│   │   ├── Notes/                (meeting transcripts & notes)
│   │   ├── Summaries/            (A043 etc.)
│   │   └── Agendas/
│   ├── SOPs/                     (standard operating procedures)
│   ├── Courses/                  (microgrid course content, if applicable)
│   └── Documents/                (PE docs, general business docs)
├── Automation/
│   ├── SOPs/                     (automation procedure docs)
│   └── Workflows/                (pipeline & integration configs)
└── Personal/
    └── Tickets/
```

---

## Naming Convention Rules

1. **Dates**: Use `YYYY-MM-DD` format (e.g., `2025-08-07`) — sorts chronologically
2. **Separators**: Use hyphens (`-`) within words, underscores (`_`) between fields
   - Pattern: `[Date]_[Topic-or-Description]_[Version].ext`
3. **No spaces**: Replace all spaces with hyphens for cleaner file paths
4. **No parenthetical duplicates**: Replace `(1)`, `(2)` with `_v2`, `_v3` or more descriptive suffixes
5. **Consistent abbreviations**: Always use `CapitalOne` (not `CapOne`), `SOP` (not `sop`)
6. **ID prefixes preserved**: Keep codes like `A024`, `A043`, `A092` — they appear to be internal tracking IDs

---

## Action Items

- [ ] Create the folder structure above in Google Drive
- [ ] Deduplicate files (Budget xlsx copies, A043 Meeting Summary copies) — compare contents, keep latest
- [ ] Rename files per the tables above
- [ ] Move files into their designated folders
- [ ] Review remaining files not visible in screenshots (scroll down) for the same treatment
- [ ] Set up Google Drive "Suggest file moves" to maintain organization going forward

---

## Duplicate Files to Investigate

| Files | Action |
|---|---|
| `A043 Meeting Summary` (Feb 17) vs `A043 Meeting Summary` (Feb 18) | Compare content, keep most complete version |
| `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (Feb 17) vs same (Feb 18) | Compare content, keep most recent |
| `2481_Capital One QuickSilver.csv` vs `(1)` copy | Check if identical or different date ranges |
| `4250_Capital One Credit Card.csv` + `(1)` + `(2)` copies | Check if identical or different date ranges |
| `8798_CapOne Credit Card.csv` vs `(1)` copy | Check if identical or different date ranges |
