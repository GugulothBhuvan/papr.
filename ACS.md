# API Contract & Endpoint Specification (ACS)

# Papr v1.0

Version: 1.0
Protocol: REST API
Format: JSON
Backend: FastAPI

---

# 1. API Principles

All APIs must:

* Return JSON
* Be stateless
* Use UUIDs
* Follow REST conventions
* Return proper HTTP status codes

Base URL:

```text id="4mk1s0"
http://localhost:8000/api
```

Future:

```text id="f7zwxv"
https://api.papr.ai
```

---

# 2. Standard Response Format

## Success

```json id="wjlwmc"
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

## Error

```json id="tvk0d7"
{
  "success": false,
  "error": {
    "code": "COMPILE_FAILED",
    "message": "Missing $ inserted"
  }
}
```

---

# 3. Health Check

## GET /health

Purpose:

Verify server availability.

Response:

```json id="pd7hd2"
{
  "status": "healthy"
}
```

---

# 4. Projects API

## Create Project

POST /projects

Request:

```json id="wnysf1"
{
  "name": "RAG Survey",
  "template": "IEEE"
}
```

Response:

```json id="u6twqf"
{
  "success": true,
  "data": {
    "project_id": "uuid"
  }
}
```

---

## List Projects

GET /projects

---

## Get Project

GET /projects/{project_id}

---

## Delete Project

DELETE /projects/{project_id}

---

# 5. Files API

## List Files

GET /projects/{project_id}/files

---

## Create File

POST /projects/{project_id}/files

Request:

```json id="4d2n7u"
{
  "filename": "intro.tex",
  "content": ""
}
```

---

## Update File

PUT /files/{file_id}

Request:

```json id="2qsy4o"
{
  "content": "\\section{Introduction}"
}
```

---

## Delete File

DELETE /files/{file_id}

---

## Upload Asset

POST /projects/{project_id}/upload

Supported:

* png
* jpg
* pdf

---

# 6. Compile API

## Compile Project

POST /compile

Request:

```json id="23y2w7"
{
  "project_id": "uuid"
}
```

Response:

```json id="sctv8a"
{
  "success": true,
  "data": {
    "pdf_url": "/storage/output.pdf",
    "compile_time": 2.1,
    "warnings": []
  }
}
```

---

# 7. Compiler Logs API

GET /projects/{project_id}/logs

Response:

```json id="n7n2rz"
{
  "logs": [],
  "errors": []
}
```

---

# 8. AI Chat API

POST /ai/chat

Request:

```json id="g04hmx"
{
  "project_id": "uuid",
  "prompt": "Explain this equation",
  "context_scope": "current_file"
}
```

Scopes:

* current_file
* entire_project
* compiler_logs

Response:

```json id="4dzbne"
{
  "response": "Explanation..."
}
```

---

# 9. AI Edit API

POST /ai/edit

Request:

```json id="8u9kg2"
{
  "project_id": "uuid",
  "selection": "text",
  "instruction": "Make academic"
}
```

Response:

```json id="cx16ld"
{
  "original": "...",
  "edited": "..."
}
```

---

# 10. AI Generate API

POST /ai/generate

Request:

```json id="f0c7rv"
{
  "type": "section",
  "topic": "Agentic AI",
  "style": "IEEE"
}
```

Types:

* section
* table
* equation
* abstract

---

# 11. Compiler Fix API

POST /ai/fix-compile

Request:

```json id="2xf9jw"
{
  "project_id": "uuid",
  "error": "Missing $ inserted"
}
```

Response:

```json id="8s6ztw"
{
  "fix": "...",
  "explanation": "..."
}
```

---

# 12. Citation Search API

GET /citations/search?q=rag

Response:

```json id="wy6umh"
{
  "papers": [
    {
      "title": "...",
      "authors": [],
      "doi": ""
    }
  ]
}
```

---

# 13. Insert Citation API

POST /citations/insert

Request:

```json id="hhp1ea"
{
  "project_id": "uuid",
  "citation_key": "lewis2020rag"
}
```

---

# 14. PDF API

## Get PDF

GET /projects/{project_id}/pdf

Response:

PDF file stream

---

## Download PDF

GET /download/{project_id}

---

# 15. AI Models API

GET /models

Response:

```json id="x2odij"
{
  "gemini": "available",
  "groq": "available"
}
```

---

# 16. Future Authentication APIs

POST /auth/login

POST /auth/register

POST /auth/logout

(MVP: disabled)

---

# 17. HTTP Status Codes

200 OK

201 Created

400 Bad Request

404 Not Found

429 Rate Limited

500 Internal Error

---

# 18. API Rate Limits

AI Endpoints:

20 requests/minute

Compile:

10 requests/minute

Upload:

50 MB max

---

# 19. OpenAPI Generation

FastAPI automatically generates:

```text id="w11hws"
/docs
```

and

```text id="n7y4zz"
/redoc
```

Use these for frontend integration.

---

# 20. Definition of Done

Backend must expose APIs for:

✅ Projects

✅ Files

✅ Compile

✅ AI

✅ Citations

✅ PDF export

Such that frontend can function entirely via APIs.
