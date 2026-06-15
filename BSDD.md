# Backend Schema & Database Design Document (BSDD)

# Papr v1.0

Version: 1.0
Product: Papr
Database: PostgreSQL (Future)
MVP Storage: Local Filesystem

---

# 1. Overview

This document defines:

* Database schema
* Relationships
* Storage strategy
* File organization
* AI history
* Citation management
* Compile history

Design Goals:

* Local-first
* Cloud-ready
* Extensible
* Multi-user compatible in future

---

# 2. Storage Strategy

## MVP

Storage:

```text
storage/
    projects/
        <project_id>/
            main.tex
            references.bib
            figures/
            sections/
            output.pdf
            metadata.json
```

No database required initially.

Metadata stored as JSON.

---

# 3. Future Database Architecture

```text
Users
   |
Projects
   |
Files
   |
Compile Logs
   |
AI History
   |
Citations
```

---

# 4. Users Table

(MVP: Optional)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Purpose:

* Authentication
* Ownership
* Future collaboration

---

# 5. Projects Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    template TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Example:

```text
id: abc123
name: RAG Survey Paper
template: IEEE
```

---

# 6. Files Table

Core table.

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT,
    file_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## File Types

Allowed:

```text
tex
bib
pdf
png
jpg
svg
csv
```

Example:

```text
main.tex
references.bib
figure1.png
```

---

# 7. Citations Table

```sql
CREATE TABLE citations (
    id UUID PRIMARY KEY,
    project_id UUID,
    citation_key TEXT,
    title TEXT,
    authors TEXT,
    year INTEGER,
    doi TEXT,
    bibtex TEXT,
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Sources:

* arXiv
* CrossRef
* Manual

---

# 8. AI History Table

Tracks AI usage.

```sql
CREATE TABLE ai_history (
    id UUID PRIMARY KEY,
    project_id UUID,
    model TEXT,
    task_type TEXT,
    prompt TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Task Types:

```text
chat
rewrite
citation
compiler_fix
generation
```

---

# 9. Compile Logs Table

```sql
CREATE TABLE compile_logs (
    id UUID PRIMARY KEY,
    project_id UUID,
    status TEXT,
    compile_time FLOAT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Status:

```text
success
failed
warning
```

---

# 10. Project Metadata

Stored in:

```text
metadata.json
```

Example:

```json
{
  "name": "RAG Survey",
  "template": "IEEE",
  "main_file": "main.tex",
  "last_opened": "2026-06-13"
}
```

---

# 11. Local Filesystem Structure

```text
storage/
└── projects/
    └── project_uuid/
        ├── main.tex
        ├── references.bib
        ├── output.pdf
        ├── metadata.json
        ├── figures/
        │   ├── fig1.png
        │   └── fig2.jpg
        └── sections/
            ├── intro.tex
            ├── methods.tex
            └── results.tex
```

---

# 12. Project Schema

Internal Python Representation:

```python
class Project:
    id: str
    name: str
    template: str
    files: list
    citations: list
```

---

# 13. File Schema

```python
class File:
    id: str
    filename: str
    path: str
    content: str
    file_type: str
```

---

# 14. Citation Schema

```python
class Citation:
    key: str
    title: str
    authors: list
    doi: str
    bibtex: str
```

---

# 15. Compile Result Schema

```python
class CompileResult:
    success: bool
    pdf_path: str
    logs: list
    errors: list
```

---

# 16. AI Request Schema

```python
class AIRequest:
    prompt: str
    context: str
    task: str
    model: str
```

---

# 17. AI Response Schema

```python
class AIResponse:
    output: str
    tokens: int
    latency: float
```

---

# 18. Relationships

```text
User
 └── Projects (1:N)

Project
 ├── Files (1:N)
 ├── Citations (1:N)
 ├── AI History (1:N)
 └── Compile Logs (1:N)
```

---

# 19. Future Extensions

v2:

* Shared projects
* Teams
* Comments
* Version history

v3:

* Branching
* Git sync

v4:

* Semantic search
* Embeddings
* RAG pipeline

---

# 20. MVP Database Decision

Use:

```text
Filesystem + JSON
```

Avoid:

* PostgreSQL
* Redis
* pgvector
* Kubernetes

Until:

At least 20 personal projects are created.

Then migrate.

---

# Definition of Done

Backend should support:

✅ Project creation

✅ File management

✅ AI history

✅ Citations

✅ Compilation logs

✅ PDF generation

With zero cloud dependency.
