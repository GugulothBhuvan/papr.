# PRD: Papr

## AI Copilot for LaTeX & Scientific Writing

Version: v2.0
Founder: Bhuvan Raj Guguloth
Stage: Personal MVP
Timeline: 30 Days

---

# 1. Vision

Papr is an AI-powered LaTeX editor and copilot that helps researchers write, edit, debug, and compile scientific documents faster.

Mission:

Make writing research papers as easy as coding with AI.

Product Positioning:

Cursor for Overleaf.

Tagline:

"AI that understands LaTeX."

---

# 2. Problem Statement

Researchers spend significant time on:

* Writing LaTeX
* Fixing compilation errors
* Searching citations
* Formatting papers
* Generating tables and figures
* Rewriting text academically

Existing tools like Overleaf provide editing and compilation but lack deep AI assistance.

Current workflow:

ChatGPT → Google Scholar → Zotero → Overleaf

Papr combines these into a single AI-powered experience.

---

# 3. Target Users

Primary Users:

* Students
* Researchers
* Graduate students
* Professors
* Engineers writing technical reports

Early Adopters:

* AI researchers
* Computer Science students
* Thesis writers
* Startup founders publishing research

---

# 4. Goals

Users should be able to:

1. Write LaTeX with AI assistance.
2. Fix compilation errors automatically.
3. Generate sections using AI.
4. Search and insert citations.
5. Export PDF seamlessly.

Success Metric:

User completes a paper without leaving Papr.

---

# 5. Non-Goals (MVP)

Do NOT build:

* Real-time collaboration
* Multiplayer editing
* Comments
* Git integration
* Mobile application
* Public sharing
* Team workspaces
* Autonomous research agents

---

# 6. Core User Stories

US-1:

As a researcher,
I want AI to generate sections,
so I can write papers faster.

US-2:

As a researcher,
I want AI to fix LaTeX errors,
so I don't waste time debugging.

US-3:

As a researcher,
I want AI-powered citations,
so I can add references quickly.

US-4:

As a researcher,
I want AI editing commands,
so I can improve writing quality.

US-5:

As a researcher,
I want live PDF preview,
so I can see document output instantly.

---

# 7. Core Features

## Feature 1: LaTeX Editor

Capabilities:

* Syntax highlighting
* File explorer
* Multi-file projects
* Auto-save

Technology:

Monaco Editor

Acceptance Criteria:

* Open .tex files
* Edit in real-time
* Support multiple files

---

## Feature 2: Live Compilation

Workflow:

Edit → Compile → Preview PDF

Technology:

Tectonic

Acceptance Criteria:

* Compile under 5 seconds
* Render PDF preview
* Display errors

---

## Feature 3: AI Chat Sidebar

Users can ask:

* Explain this equation
* Generate introduction
* Convert to IEEE format
* Improve writing
* Add citations

Acceptance Criteria:

* Context-aware responses
* Access current document

---

## Feature 4: Selection Editing

User highlights text:

Prompt:

"Make this more academic"

AI edits only selection.

Supported Commands:

* Improve writing
* Academic tone
* Simplify
* Expand
* Summarize
* Explain

Acceptance Criteria:

* Preserve document structure
* Fast response (<3 sec)

---

## Feature 5: Section Generation

User:

"Generate Related Work section for RAG."

Output:

LaTeX section content.

Acceptance Criteria:

* Generate valid LaTeX
* Context-aware writing

---

## Feature 6: Compiler Error Fix

Input:

LaTeX compiler logs.

AI outputs:

* Explanation
* Suggested fix
* Auto-fix option

Acceptance Criteria:

* Fix common errors automatically

Examples:

* Missing braces
* Undefined references
* Table errors
* Math mode issues

---

## Feature 7: Citation Search

User:

/cite retrieval augmented generation

Pipeline:

Search → Select → Insert BibTeX

Data Sources:

* arXiv API
* CrossRef API

Acceptance Criteria:

* DOI verification
* Valid BibTeX generation

---

## Feature 8: Table & Figure Generation

User:

"Create comparison table for RAG methods."

AI generates:

* LaTeX table
* Figure templates

Acceptance Criteria:

* Compilable LaTeX output

---

# 8. AI Architecture

## AI Router

Purpose:

Route tasks to optimal models.

---

## Gemini Tasks

Use Gemini 2.5 Flash for:

* Long-context reasoning
* Section generation
* Document understanding
* PDF summarization
* Research assistance

---

## Groq Tasks

Use Groq for:

* Selection edits
* Compiler fixes
* Text transformations
* Formatting
* JSON generation

---

# 9. AI Workflow

User Prompt
↓
Document Context Retrieval
↓
AI Router
↓
Gemini / Groq
↓
Validation
↓
Update Document

---

# 10. System Architecture

Frontend
↓
FastAPI Backend
↓
AI Router
↓
Compiler Service
↓
Citation Service
↓
Storage Layer

---

# 11. Technical Stack

Frontend:

* Next.js
* React
* TailwindCSS
* Monaco Editor
* PDF.js

Backend:

* FastAPI
* Python

AI:

* Gemini Free Tier
* Groq API

Compiler:

* Tectonic

Database (Later):

* PostgreSQL
* Supabase

Deployment:

Frontend:

Vercel Free

Backend:

Render Free

Storage:

Local files initially

---

# 12. File Structure

Project
├── main.tex
├── references.bib
├── sections/
├── figures/
└── output.pdf

---

# 13. API Endpoints

POST /compile

POST /ai/chat

POST /ai/edit

POST /ai/generate

POST /citations/search

POST /citations/insert

GET /pdf

---

# 14. Security

* Input sanitization
* LaTeX sandboxing
* File validation
* Rate limiting

---

# 15. Analytics

Track:

* Papers created
* AI requests
* Compile failures
* Citation searches
* Generated sections

---

# 16. MVP Roadmap

Week 1:

* Monaco editor
* File explorer
* Tectonic compile
* PDF preview

Week 2:

* AI chat sidebar
* Gemini integration
* Groq integration

Week 3:

* Selection editing
* Compiler fixing
* Citation search

Week 4:

* Polish UI
* Deployment
* Personal testing

---

# 17. Future Roadmap

v2:

* Git integration
* Project templates
* Citation manager

v3:

* Collaboration
* Shared projects

v4:

* AI research agents
* Literature review assistant

v5:

* Full research operating system

---

# Definition of Done

A researcher can:

1. Open a LaTeX project.
2. Edit with AI.
3. Fix compile errors automatically.
4. Add citations.
5. Export PDF.

Without opening ChatGPT or Overleaf.
