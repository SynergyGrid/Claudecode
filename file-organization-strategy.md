# Google Drive File Organization Strategy

## Naming Convention Rules

1. **Dates**: Use `YYYY-MM-DD` format — sorts chronologically
2. **Separators**: Underscores (`_`) between logical fields, hyphens (`-`) within multi-word phrases
3. **No spaces**: Replace all spaces with hyphens
4. **No parenthetical duplicates**: Replace `(1)`, `(2)` with `_v2`, `_v3` or descriptive suffixes
5. **Consistent naming**: Always use full names (e.g., `CapitalOne` not `CapOne`)
6. **Internal IDs preserved**: Keep codes like `A024`, `A043`, `A092`

---

## Existing Folder Structure

```
My Drive/
├── _Consulting/
│   ├── Active Projects/
│   ├── NDA/
│   └── (GF) Fireflies Meetings/
├── Accounting/
│   ├── Acctg Custom GPT/
│   ├── Archive Accounting.../
│   ├── BiBerk Insurance/
│   ├── Billing & Invoices/
│   ├── Financial Documents.../
│   ├── Nigeria Trip/
│   ├── Tax Documents/
│   └── Vegan Superhero (.../
├── AdminOperations/
│   ├── Archived Departments.../
│   ├── Business Reinstate.../
│   ├── Call Transcription/
│   ├── Comapny Projects/
│   ├── Contacts/
│   ├── Events, Conferences.../
│   ├── Foreclosure case/
│   ├── HR/
│   ├── MVA License Resolution.../
│   ├── Panel/
│   ├── Presentations/
│   ├── RFP's/
│   ├── SG Team Documents.../
│   └── West African Travel/
├── AI/
├── Automation Folder/
├── Microgrid modules/
│   ├── Case studies/
│   ├── New Version/
│   ├── Old version/
│   ├── Teaching Documents.../
│   └── Teaching Schedule/
└── SG Team Meeting/
    ├── Ada/
    └── SG Interview/
```

---

## File Categorization — Where Each File Goes

### → `Accounting / Billing & Invoices/`

Credit card statements and utility records.

| # | Current Name | Renamed |
|---|---|---|
| 1 | `2481_Capital One QuickSilver.csv` | `2481_CapitalOne-QuickSilver_Statement.csv` |
| 2 | `2481_Capital One QuickSilver (1).csv` | `2481_CapitalOne-QuickSilver_Statement_v2.csv` |
| 3 | `4250_Capital One Credit Card.csv` | `4250_CapitalOne_Statement.csv` |
| 4 | `4250_Capital One Credit Card (1).csv` | `4250_CapitalOne_Statement_v2.csv` |
| 5 | `4250_Capital One Credit Card (2).csv` | `4250_CapitalOne_Statement_v3.csv` |
| 6 | `8798_CapOne Credit Card.csv` | `8798_CapitalOne_Statement.csv` |
| 7 | `8798_CapOne Credit Card (1).csv` | `8798_CapitalOne_Statement_v2.csv` |
| 8 | `12 months energy usage.xlsx` | `12-Month-Energy-Usage_Report.xlsx` |

> **Duplicate check:** The `(1)` and `(2)` CSV copies may be different date ranges or true duplicates. Compare file sizes — if identical, delete the extras.

### → `Accounting / Financial Documents.../`

Budget files and financial planning documents.

| # | Current Name | Renamed |
|---|---|---|
| 9 | `Budget_11.5.2025` (Google Sheet) | `Budget_2025-11-05` |
| 10 | `Budget_11.5.2025 (Math Checked 2-12-26)` (Google Sheet) | `Budget_2025-11-05_Verified-2026-02-12` |
| 11 | `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (Feb 17, 17 KB) | `Budget_2025-11-05_Verified-2026-02-12.xlsx` |
| 12 | `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (Feb 18, 16 KB) | **DELETE** — likely older copy of #11 |

> **Duplicate check:** Two `.xlsx` budget files (Feb 17 = 17 KB, Feb 18 = 16 KB). Compare and keep the most complete.

### → `SG Team Meeting/`

Dated meeting notes — these belong in the existing `SG Team Meeting` folder at root level.

| # | Current Name | Renamed |
|---|---|---|
| 13 | `2nd half Oct 2, 2025 \| Developing Community Microgrids` | `2025-10-02_Developing-Community-Microgrids_Part-2` |
| 14 | `August 7, 2025 \| Synergy Grid & Nicole Sitaraman: Microgrid Course & Industry Discussion` | `2025-08-07_Nicole-Sitaraman_Microgrid-Course-Industry-Discussion` |
| 15 | `August 12, 2025 \| GreenFlo Microgrid Course Content Review` | `2025-08-12_GreenFlo_Microgrid-Course-Content-Review` |
| 16 | `August 13, 2025 \| Course Content Restructuring Meeting` | `2025-08-13_Course-Content-Restructuring-Meeting` |
| 17 | `August 13, 2025 \| Synergy Grid & Jamal Lewis Course Content Review` | `2025-08-13_Jamal-Lewis_Course-Content-Review` |
| 18 | `August 14, 2025 \| Introduction to Microgrids Course Overview` | `2025-08-14_Intro-to-Microgrids-Course-Overview` |
| 19 | `A043 Meeting Summary` (Feb 17, 1 KB) | `A043_Meeting-Summary` |
| 20 | `A043 Meeting Summary` (Feb 18, 1 KB) | **DELETE** — duplicate of #19 |

### → `SG Team Meeting / Ada/`

Ada's agenda belongs in her existing subfolder.

| # | Current Name | Renamed |
|---|---|---|
| 21 | `Ada's UnityCloud Agenda` | `Ada_UnityCloud-Agenda` |

### → `AdminOperations / SG Team Documents.../`

The agenda creation SOP is an operational procedure for the SG team.

| # | Current Name | Renamed |
|---|---|---|
| 22 | `Agenda creation SOP` | `SOP_Agenda-Creation` |

### → `Automation Folder/`

All automation-related SOPs and workflow documents.

| # | Current Name | Renamed |
|---|---|---|
| 23 | `A024A (SOP) Extract Text And Logging` | `A024-A_SOP_Extract-Text-and-Logging` |
| 24 | `A024-B (SOP) Google Sheet to Pinecone` | `A024-B_SOP_GoogleSheet-to-Pinecone` |
| 25 | `A092 Automation List to Pinecone` | `A092_Automation-List-to-Pinecone` |

### → `AdminOperations / SG Team Documents.../`

General SynergyGrid business document.

| # | Current Name | Renamed |
|---|---|---|
| 26 | `7857716 Synergygrid (PE).pdf` | `7857716_SynergyGrid-PE.pdf` |

### → `AdminOperations/`

Personal/admin ticket — keep at the AdminOperations root level.

| # | Current Name | Renamed |
|---|---|---|
| 27 | `1980551217005-14137383053-ticket.pdf` | `Ticket_1980551217005-14137383053.pdf` |

---

## Summary

| Destination Folder | Files |
|---|---|
| `Accounting / Billing & Invoices` | #1–8 (credit card CSVs + energy usage) |
| `Accounting / Financial Documents` | #9–12 (budget files) |
| `SG Team Meeting` | #13–20 (dated meeting notes + A043 summary) |
| `SG Team Meeting / Ada` | #21 (Ada's agenda) |
| `AdminOperations / SG Team Documents` | #22 (Agenda SOP), #26 (PE document) |
| `Automation Folder` | #23–25 (automation SOPs & workflows) |
| `AdminOperations` | #27 (ticket PDF) |

- **27 files** categorized into existing folders
- **2 deletions** recommended (duplicates: #12 and #20)
- **No new folders needed** — everything fits the existing structure
