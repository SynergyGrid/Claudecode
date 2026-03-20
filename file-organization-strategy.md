# Google Drive File Organization Strategy

## Naming Convention Rules

1. **Dates**: Use `YYYY-MM-DD` format — sorts chronologically
2. **Separators**: Underscores (`_`) between logical fields, hyphens (`-`) within multi-word phrases
3. **No spaces**: Replace all spaces with hyphens
4. **No parenthetical duplicates**: Replace `(1)`, `(2)` with `_v2`, `_v3` or descriptive suffixes
5. **Consistent naming**: Always use full names (e.g., `CapitalOne` not `CapOne`)
6. **Internal IDs preserved**: Keep codes like `A024`, `A043`, `A092`

---

## File Renames — By Category

### Credit Card Statements

| # | Current Name | Renamed |
|---|---|---|
| 1 | `2481_Capital One QuickSilver.csv` | `2481_CapitalOne-QuickSilver_Statement.csv` |
| 2 | `2481_Capital One QuickSilver (1).csv` | `2481_CapitalOne-QuickSilver_Statement_v2.csv` |
| 3 | `4250_Capital One Credit Card.csv` | `4250_CapitalOne_Statement.csv` |
| 4 | `4250_Capital One Credit Card (1).csv` | `4250_CapitalOne_Statement_v2.csv` |
| 5 | `4250_Capital One Credit Card (2).csv` | `4250_CapitalOne_Statement_v3.csv` |
| 6 | `8798_CapOne Credit Card.csv` | `8798_CapitalOne_Statement.csv` |
| 7 | `8798_CapOne Credit Card (1).csv` | `8798_CapitalOne_Statement_v2.csv` |

> **Duplicate check:** The `(1)` and `(2)` copies may be different date ranges or true duplicates. Compare file sizes — if identical, delete the extras.

### Budgets & Financial Reports

| # | Current Name | Renamed |
|---|---|---|
| 8 | `12 months energy usage.xlsx` | `12-Month-Energy-Usage_Report.xlsx` |
| 9 | `Budget_11.5.2025` (Google Sheet) | `Budget_2025-11-05` |
| 10 | `Budget_11.5.2025 (Math Checked 2-12-26)` (Google Sheet) | `Budget_2025-11-05_Verified-2026-02-12` |
| 11 | `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (Feb 17, 17 KB) | `Budget_2025-11-05_Verified-2026-02-12.xlsx` |
| 12 | `Budget_11.5.2025 (Math Checked 2-12-26).xlsx` (Feb 18, 16 KB) | **DELETE** — likely older copy of #11 |

> **Duplicate check:** Two `.xlsx` budget files with same name (Feb 17 = 17 KB, Feb 18 = 16 KB). Compare and keep the most complete.

### Meeting Notes (Synergy Grid)

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
| 21 | `Ada's UnityCloud Agenda` | `Ada_UnityCloud-Agenda` |
| 22 | `Agenda creation SOP` | `SOP_Agenda-Creation` |

> **Pattern applied:** All meeting notes now lead with `YYYY-MM-DD` so they sort chronologically. The pipe (`|`) separator is removed.

### Automation SOPs & Workflows

| # | Current Name | Renamed |
|---|---|---|
| 23 | `A024A (SOP) Extract Text And Logging` | `A024-A_SOP_Extract-Text-and-Logging` |
| 24 | `A024-B (SOP) Google Sheet to Pinecone` | `A024-B_SOP_GoogleSheet-to-Pinecone` |
| 25 | `A092 Automation List to Pinecone` | `A092_Automation-List-to-Pinecone` |

> **Pattern applied:** ID codes kept as prefix, `(SOP)` normalized to `_SOP_`, consistent hyphenation.

### Business & Personal Documents

| # | Current Name | Renamed |
|---|---|---|
| 26 | `7857716 Synergygrid (PE).pdf` | `7857716_SynergyGrid-PE.pdf` |
| 27 | `1980551217005-14137383053-ticket.pdf` | `Ticket_1980551217005-14137383053.pdf` |

### Folders

| # | Current Name | Renamed |
|---|---|---|
| 28 | `SG Team Meeting` | `SG-Team-Meetings` |

---

## Existing Folder Destinations

Based on what's visible, the existing folder structure should be used as-is. Move files into:

| Destination Folder | Files to Move (by #) |
|---|---|
| `SG-Team-Meetings/` (renamed #28) | #13–20 (all meeting notes & summaries) |
| Root (keep in place) | #1–12 (financial files), #21–27 (SOPs, documents) |

> If additional folders exist deeper in the Drive, meeting notes and SOPs should be moved into the most relevant existing subfolder rather than staying at root level.

---

## Summary of Changes

- **28 files/folders** reviewed
- **26 renames** proposed
- **2 deletions** recommended (duplicates)
- **Key fixes:** Date format standardization, space removal, `CapOne` → `CapitalOne`, `(1)`/`(2)` → `_v2`/`_v3`, pipe separators removed
