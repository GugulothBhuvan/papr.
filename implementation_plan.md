# Implementation Plan & Sprint Breakdown (IPSD)

# Papr v1.0

Version: 1.0
Founder: Bhuvan Raj Guguloth
Timeline: 30 Days
Methodology: Agile Sprint-Based Development

---

# 1. Development Philosophy

Rules:

1. Ship fast.
2. Build for personal use first.
3. No premature optimization.
4. No microservices.
5. No collaboration in MVP.
6. AI is a feature, not infrastructure.

---

# 2. Tech Stack

Frontend:

* Next.js 15
* TypeScript
* TailwindCSS
* Monaco Editor
* PDF.js
* Zustand

Backend:

* FastAPI
* Python 3.12
* Tectonic

AI:

* Gemini 2.5 Flash
* Groq API

Deployment:

* Vercel
* Render

Storage:

* Local filesystem

---

# 3. Milestone Roadmap

Milestone 1:

Working Overleaf clone

Milestone 2:

AI integration

Milestone 3:

Research workflows

Milestone 4:

Production deployment

---

# 4. Sprint 0: Project Setup (Day 1)

Goal:

Initialize project.

Tasks:

Frontend:

```bash id="3a6z2q"
npx create-next-app@latest frontend
```

Backend:

```bash id="e32t9e"
mkdir backend
```

Initialize:

```bash id="43f7hb"
git init
```

Create:

```text id="0ogzab"
papr/
├── frontend/
├── backend/
├── docs/
└── storage/
```

Deliverable:

Project runs locally.

---

# 5. Sprint 1: Editor Foundation (Days 2-5)

Goal:

Build basic Overleaf clone.

Features:

## File Explorer

Tasks:

* Create project
* Add file
* Delete file
* Rename file

Deliverable:

Multi-file project support.

---

## Monaco Editor

Tasks:

* Syntax highlighting
* Save file
* Open file

Deliverable:

Functional editor.

---

## Auto Save

Requirements:

* Save every 3 seconds
* Display status

Deliverable:

Persistent files.

---

# 6. Sprint 2: LaTeX Compilation (Days 6-8)

Goal:

Compile LaTeX to PDF.

Tasks:

Install Tectonic.

Compile pipeline:

```text id="w9yq4l"
Files
↓
Temp Directory
↓
Tectonic
↓
PDF
```

Features:

* Compile button
* PDF preview
* Error logs

Deliverable:

Working compiler.

---

# 7. Sprint 3: PDF Viewer (Days 9-10)

Use:

PDF.js

Features:

* Zoom
* Pagination
* Download

Deliverable:

Live preview.

---

# 8. Sprint 4: AI Foundation (Days 11-13)

Goal:

Connect Gemini and Groq.

Tasks:

Create:

```python id="5s2nma"
AIService
```

Methods:

```python id="zz9wyh"
chat()
edit()
generate()
fix()
```

Deliverable:

AI APIs working.

---

# 9. Sprint 5: AI Chat (Days 14-15)

Features:

* Chat sidebar
* Context builder
* Insert response

Deliverable:

Context-aware AI.

---

# 10. Sprint 6: Selection Editing (Days 16-18)

Workflow:

Select text
↓
⌘K
↓
Prompt
↓
AI edit
↓
Diff viewer

Commands:

* Improve
* Academic
* Expand
* Shorten

Deliverable:

Cursor-style editing.

---

# 11. Sprint 7: Compiler Fix Agent (Days 19-20)

Features:

* Parse logs
* AI explanation
* Auto-fix

Deliverable:

AI debugging.

---

# 12. Sprint 8: Citation Engine (Days 21-23)

Integrate:

* arXiv API
* CrossRef API

Features:

* Search papers
* Generate BibTeX
* Insert citations

Deliverable:

Working citation system.

---

# 13. Sprint 9: AI Generation (Days 24-26)

Features:

Generate:

* Abstract
* Introduction
* Related Work
* Conclusion
* Tables
* Equations

Deliverable:

AI authoring.

---

# 14. Sprint 10: Polish (Days 27-28)

Tasks:

* Keyboard shortcuts
* Error states
* Loading states
* Tooltips

Deliverable:

Production-ready UX.

---

# 15. Sprint 11: Deployment (Days 29-30)

Frontend:

Deploy to Vercel.

Backend:

Deploy to Render.

Configure:

Environment variables.

Deliverable:

Public MVP.

---

# 16. Environment Variables

Frontend:

```env id="v3ucf0"
NEXT_PUBLIC_API_URL=
```

Backend:

```env id="7mdv1n"
GEMINI_API_KEY=
GROQ_API_KEY=
```

Optional:

```env id="12m5ae"
ARXIV_API_KEY=
CROSSREF_EMAIL=
```

---

# 17. Folder Structure

```text id="n7m0na"
papr/
├── frontend/
├── backend/
├── storage/
├── docs/
└── docker/
```

Backend:

```text id="kgvylq"
backend/
├── api/
├── ai/
├── compiler/
├── citations/
├── models/
└── services/
```

Frontend:

```text id="azn7j4"
frontend/
├── app/
├── components/
├── hooks/
├── store/
└── lib/
```

---

# 18. Definition of MVP

A user can:

1. Create project
2. Edit LaTeX
3. Compile PDF
4. Preview PDF
5. Use AI chat
6. Edit with AI
7. Fix compiler errors
8. Add citations
9. Export PDF

Without using ChatGPT or Overleaf.

---

# 19. Success Metrics

Technical:

* Compile success >95%
* AI latency <5 sec
* Editor load <2 sec

User:

* Write 5+ papers using Papr
* Replace Overleaf personally

---

# 20. Post-MVP Roadmap

v1.1

* Project templates
* Settings page

v1.2

* Cloud sync

v2.0

* Collaboration

v3.0

* AI research agents
