# UI/UX Design Specification (UXD)

# Papr v1.0

Version: 1.0
Product: Papr
Positioning: Cursor for Overleaf

---

# 1. Design Principles

## Principle 1: AI should feel invisible

Users should not "use AI."

Users should write papers naturally while AI assists.

Bad UX:

Open chat → copy text → paste → edit

Good UX:

Highlight text → ⌘K → AI action

---

## Principle 2: Research-first design

The UI should feel:

* professional
* minimal
* distraction-free

Inspired by:

* Cursor
* VS Code
* Overleaf
* Linear

---

## Principle 3: AI must be contextual

AI always has access to:

* current file
* project files
* bibliography
* compiler logs

Users should never manually provide context.

---

# 2. Design System

## Theme

Default:

Dark Mode

Secondary:

Light Mode

---

## Color Palette

Background:

#0B0F17

Surface:

#111827

Primary:

#3B82F6

Success:

#22C55E

Warning:

#F59E0B

Error:

#EF4444

Text:

#F9FAFB

---

## Typography

Primary:

Inter

Code:

JetBrains Mono

---

# 3. Layout Structure

```text
---------------------------------------------------------
| Navbar                                                 |
---------------------------------------------------------
| File Tree | Monaco Editor | PDF Preview / AI Chat     |
---------------------------------------------------------
| Compiler Console                                      |
---------------------------------------------------------
```

---

# 4. Screen: Dashboard

## Components

Header:

Papr logo

Buttons:

* New Project

Import Project

Recent Projects

Project Card:

* Name
* Last edited
* Template
* Open button

---

# 5. Screen: Editor

## Left Sidebar

Width:

240px

Components:

Project Tree

Example:

project
├── main.tex
├── references.bib
├── sections/
└── figures/

Actions:

* Add File
* Upload File
* Delete File

---

## Center Panel

Component:

Monaco Editor

Features:

* Syntax highlighting
* Error markers
* Autocomplete
* Find/Replace
* Multi-cursor
* Minimap

---

## Right Panel

Modes:

1. PDF Preview
2. AI Chat

Toggle between modes.

---

# 6. PDF Preview

Features:

* Live refresh
* Zoom
* Page navigation
* Download PDF

States:

Loading

Success

Compile Error

---

# 7. AI Chat Sidebar

Input box:

Ask Papr...

Example prompts:

* Explain equation
* Fix this error
* Generate introduction
* Add citations

Messages:

User on right

AI on left

---

# 8. Inline AI

Most important feature.

User highlights text.

Popup appears:

```text
Improve
Academic
Shorten
Expand
Explain
Ask AI
```

Shortcut:

⌘K

---

# 9. Slash Commands

Supported:

```text
/cite
/fix
/rewrite
/section
/table
/equation
/explain
```

Example:

```text
/cite retrieval augmented generation
```

Result:

Citation picker modal.

---

# 10. Citation Modal

Search input:

Search papers...

Results:

Paper Title

Authors

Year

DOI

Buttons:

Preview

Insert

---

# 11. Compiler Console

Bottom panel.

Shows:

* warnings
* errors
* compile time

Example:

Line 42:
Missing $

Button:

Fix with AI

---

# 12. AI Diff Viewer

When AI edits:

Display:

```diff
- old text
+ new text
```

Buttons:

Accept

Reject

---

# 13. User Flow

Create Project
↓
Open Editor
↓
Write LaTeX
↓
Compile PDF
↓
Fix Errors
↓
Use AI
↓
Insert Citations
↓
Export PDF

---

# 14. Empty States

No Project:

"Start your first paper."

No PDF:

"Compile to generate preview."

No Citations:

"Search and add references."

---

# 15. Keyboard Shortcuts

⌘S

Save

⌘B

Compile

⌘K

AI Edit

⌘/

Toggle AI Chat

Ctrl+Space

Autocomplete

---

# 16. Responsive Design

Desktop:

Full support

Tablet:

Read-only PDF

Mobile:

Not supported in MVP

---

# 17. Accessibility

Requirements:

* keyboard navigation
* ARIA labels
* contrast ratio > 4.5
* screen reader support

---

# 18. MVP Screens

1. Dashboard
2. Editor
3. Citation Modal
4. AI Chat
5. Compiler Console
6. Settings

Total:

6 screens only.

Avoid feature creep.
