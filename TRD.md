# Technical Requirements Document (TRD)

# Papr v1.0

## Cursor for Overleaf

Version: 1.0
Author: Bhuvan Raj Guguloth
Stage: MVP
Timeline: 30 Days

---

# 1. Overview

Papr is an AI-powered LaTeX editor and research copilot designed to accelerate scientific writing through AI-assisted editing, citation search, and automated compilation.

The system aims to combine:

* Overleaf's editing experience
* Cursor's AI interactions
* ChatGPT's intelligence

---

# 2. Technical Goals

## Primary Goals

1. Build a browser-based LaTeX editor.
2. Support multi-file projects.
3. Compile LaTeX to PDF.
4. Enable AI-assisted editing.
5. Integrate citation search.
6. Support local-first storage.

---

# 3. Non-Functional Requirements

## Performance

| Metric           | Target  |
| ---------------- | ------- |
| Editor Load Time | < 2 sec |
| Compile Time     | < 5 sec |
| AI Edit Latency  | < 3 sec |
| PDF Render       | < 2 sec |
| Citation Search  | < 5 sec |

---

## Reliability

| Metric               | Target |
| -------------------- | ------ |
| Compile Success Rate | >95%   |
| API Availability     | 99%    |
| Auto-save Success    | 100%   |

---

## Scalability

MVP:

* Single-user
* Local storage

Future:

* Multi-user
* Cloud sync
* Collaboration

---

# 4. High-Level Architecture

```text
+------------------+
| Next.js Frontend |
+------------------+
          |
          v
+------------------+
| FastAPI Backend  |
+------------------+
          |
   +------+------+------+
   |             |      |
   v             v      v
 AI Router   Compiler  Citation
              Service   Service
   |             |
   v             v
Gemini        Tectonic
Groq
```

---

# 5. Frontend Architecture

## Framework

* Next.js 15
* React 19
* TypeScript

---

## UI Libraries

* TailwindCSS
* shadcn/ui
* Lucide Icons

---

## State Management

Global State:

* Zustand

Server State:

* TanStack Query

---

## Editor

Technology:

* Monaco Editor

Features:

* Syntax highlighting
* Error markers
* Multi-file support
* Keyboard shortcuts
* Inline AI actions

---

## PDF Preview

Technology:

* PDF.js

Features:

* Live preview
* Zoom
* Page navigation

---

# 6. Backend Architecture

Framework:

* FastAPI

Language:

* Python 3.12

Server:

* Uvicorn

Validation:

* Pydantic

---

# 7. AI Architecture

## AI Router

Purpose:

Select optimal LLM for each task.

---

## Gemini Tasks

Model:

Gemini 2.5 Flash

Used for:

* Section generation
* Document understanding
* Long-context reasoning
* PDF summarization

---

## Groq Tasks

Models:

* llama-3.3-70b-versatile
* qwen3-32b

Used for:

* Editing
* Formatting
* Compiler fixes
* Rewriting

---

## Routing Rules

| Task               | Model  |
| ------------------ | ------ |
| Generate Section   | Gemini |
| Explain Document   | Gemini |
| Rewrite Text       | Groq   |
| Fix Compiler Error | Groq   |
| Format LaTeX       | Groq   |
| Summarize PDF      | Gemini |

---

# 8. Document Architecture

## Project Structure

```text
project/
├── main.tex
├── references.bib
├── sections/
│   ├── intro.tex
│   ├── methods.tex
│   └── results.tex
├── figures/
└── output.pdf
```

---

## Internal Representation

```json
{
  "project_id": "uuid",
  "name": "Research Paper",
  "files": [],
  "metadata": {}
}
```

---

# 9. Compiler Service

Compiler:

Tectonic

Compile Flow:

```text
.tex files
     ↓
Temporary Workspace
     ↓
Tectonic Compile
     ↓
PDF Output
     ↓
Error Parser
```

---

## Compile API

Endpoint:

POST /api/compile

Request:

```json
{
  "project_id": "123"
}
```

Response:

```json
{
  "status": "success",
  "pdf_url": "/output.pdf"
}
```

---

# 10. Error Parser

Input:

Compiler logs

Output:

```json
{
  "line": 42,
  "error": "Missing $ inserted"
}
```

Pipeline:

Compile
↓
Parse Errors
↓
Send to AI
↓
Return Fix

---

# 11. Citation Service

External Sources:

* arXiv API
* CrossRef API

Workflow:

```text
Search Query
      ↓
Retrieve Papers
      ↓
Rank Results
      ↓
Generate BibTeX
      ↓
Insert Citation
```

---

# 12. Storage Strategy

MVP:

Local filesystem

Structure:

```text
storage/
  projects/
```

Future:

* Supabase Storage
* S3

---

# 13. Database Schema (Future)

Projects

```sql
projects(
    id UUID PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP
)
```

Files

```sql
files(
    id UUID PRIMARY KEY,
    project_id UUID,
    filename TEXT,
    content TEXT
)
```

AI History

```sql
ai_history(
    id UUID PRIMARY KEY,
    prompt TEXT,
    response TEXT,
    model TEXT
)
```

---

# 14. API Specification

## AI Chat

POST /api/ai/chat

```json
{
  "prompt": "Explain equation",
  "context": "..."
}
```

---

## AI Edit

POST /api/ai/edit

```json
{
  "selection": "...",
  "instruction": "Make academic"
}
```

---

## Generate Section

POST /api/ai/generate

```json
{
  "title": "Introduction",
  "context": "RAG systems"
}
```

---

## Search Citation

GET /api/citations/search?q=rag

---

## Compile

POST /api/compile

---

# 15. Security

## LaTeX Sandboxing

Requirements:

* Isolated compile environment
* Temporary directories
* Resource limits
* Execution timeout

---

## File Validation

Allowed Extensions:

* .tex
* .bib
* .png
* .jpg
* .pdf

Maximum Upload:

50 MB

---

# 16. Deployment Architecture

Frontend:

* Vercel

Backend:

* Render

Compiler:

* Docker container

---

## Docker Services

```yaml
frontend
backend
compiler
```

---

# 17. Monitoring

Track:

* Compile failures
* AI latency
* API errors
* Storage usage

Tools:

* PostHog (future)
* Sentry (future)

---

# 18. Development Environment

Frontend:

```bash
npm run dev
```

Backend:

```bash
uvicorn app.main:app --reload
```

Compiler:

```bash
docker compose up
```

---

# 19. Folder Structure

```text
papr/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── lib/
│
├── backend/
│   ├── api/
│   ├── ai/
│   ├── compiler/
│   ├── citations/
│   ├── services/
│   └── models/
│
├── storage/
├── docker/
└── docs/
```

---

# 20. MVP Success Criteria

A user should be able to:

1. Create a project.
2. Write LaTeX.
3. Compile to PDF.
4. Use AI to edit text.
5. Fix compiler errors.
6. Insert citations.
7. Export final PDF.

Without leaving Papr.
