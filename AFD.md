# App Flow Document (AFD)

# Papr v1.0

Version: 1.0
Product: Papr
Positioning: Cursor for Overleaf

---

# 1. Purpose

This document defines all user journeys, system interactions, and workflow states in Papr.

Goals:

* Define user navigation
* Define AI interaction flows
* Define compile workflows
* Define citation workflows
* Define edge cases

---

# 2. High-Level User Journey

```text
Landing Page
      ↓
Dashboard
      ↓
Create/Open Project
      ↓
Editor Workspace
      ↓
Write LaTeX
      ↓
Compile PDF
      ↓
Use AI
      ↓
Fix Errors
      ↓
Export PDF
```

---

# 3. Landing Flow

User enters application.

System checks:

* Existing projects
* Session state

Decision:

IF new user:

Show onboarding.

ELSE:

Open dashboard.

---

# 4. Dashboard Flow

User actions:

1. Create Project
2. Import Project
3. Open Existing Project
4. Delete Project

Flow:

Dashboard
↓
User Action
↓
Project Initialization
↓
Open Editor

---

# 5. Create Project Flow

User clicks:

* New Project

System displays:

Templates:

* Blank
* IEEE
* ACM
* Thesis

User selects template.

System creates:

```text
project/
├── main.tex
├── references.bib
└── figures/
```

Open editor.

Success State:

Project created.

---

# 6. Import Project Flow

User uploads:

* ZIP file
* TEX files

System:

Validate files
↓
Extract project
↓
Build tree
↓
Open editor

Error Cases:

* Missing main.tex
* Invalid files
* Large uploads

---

# 7. Editor Flow

Workspace:

Left Sidebar
↓
Editor
↓
PDF Preview
↓
Compiler Console

User edits file.

System:

Auto-save every 3 seconds.

---

# 8. Compile Flow

User presses:

Compile

Shortcut:

⌘B

System:

Save files
↓
Create temporary workspace
↓
Run Tectonic
↓
Generate PDF
↓
Return logs

Decision:

Compile Success?

YES:
Render PDF.

NO:
Show errors.

---

# 9. Compiler Error Flow

Compile Failure
↓
Parse Error
↓
Highlight Line
↓
Display Message

User options:

* Manual Fix
* Fix with AI

AI Fix Flow:

Compiler Error
↓
Send to Groq
↓
Generate Fix
↓
Show Diff
↓
Accept/Reject

---

# 10. AI Chat Flow

User opens chat.

Prompt:

"Generate introduction."

System retrieves:

* Current file
* Open project
* Bibliography

Build context.

Send to AI.

Return response.

User actions:

* Copy
* Insert
* Replace Selection

---

# 11. Selection Edit Flow

User highlights text.

Shortcut:

⌘K

Menu:

* Improve
* Academic
* Expand
* Shorten
* Explain
* Custom Prompt

Flow:

Selection
↓
Instruction
↓
Groq
↓
Diff Viewer
↓
Accept/Reject

---

# 12. Citation Flow

User command:

```text
/cite retrieval augmented generation
```

System:

Search APIs
↓
Return papers
↓
User selects paper
↓
Generate BibTeX
↓
Update references.bib
↓
Insert citation key

Success Message:

Citation inserted.

---

# 13. PDF Preview Flow

User compiles.

System:

Load PDF
↓
Render via PDF.js
↓
Sync page state

Features:

* Zoom
* Page navigation
* Download

---

# 14. File Management Flow

Actions:

Create File
Rename File
Delete File
Upload File

Rules:

Prevent deletion of:

main.tex

without confirmation.

---

# 15. Export Flow

User clicks:

Export PDF

System:

Compile latest version
↓
Generate PDF
↓
Download file

Failure:

Show compile errors.

---

# 16. Auto Save Flow

Editor change
↓
Debounce 3 seconds
↓
Save file
↓
Update state

Display:

"Saved"

or

"Unsaved changes"

---

# 17. Session Recovery Flow

Unexpected refresh:

Browser reload
↓
Load local state
↓
Restore project

---

# 18. AI Context Pipeline

User Request
↓
Retrieve Current File
↓
Retrieve Related Files
↓
Retrieve Compiler Logs
↓
Build Prompt
↓
Send to Model
↓
Return Response

---

# 19. Error States

## AI Failure

Display:

"AI temporarily unavailable."

Retry option.

---

## Compiler Failure

Display:

Error details.

AI fix button.

---

## Citation Failure

Display:

"No papers found."

Allow manual entry.

---

## Upload Failure

Display:

"Invalid file type."

---

# 20. Future Flows (v2)

* Collaboration
* Shared editing
* Git sync
* Cloud sync
* Version history
* Branching

---

# MVP Flows

Mandatory:

✅ Create Project

✅ Open Project

✅ Edit File

✅ Compile PDF

✅ AI Edit

✅ AI Chat

✅ Citation Search

✅ Export PDF

Everything else is optional

---