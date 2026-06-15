# AI Agent Specification (AAS)

# Papr v1.0

Version: 1.0
Product: Papr
AI Stack: Gemini 2.5 Flash + Groq

---

# 1. Overview

Papr uses specialized AI agents instead of a single chatbot.

Goal:

Provide context-aware AI assistance throughout the LaTeX workflow.

Principles:

* AI should be invisible
* AI should be contextual
* AI should never hallucinate citations
* AI should preserve valid LaTeX

---

# 2. AI Architecture

```text id="f1k9dr"
User Action
     ↓
Context Builder
     ↓
AI Router
     ↓
Specialized Agent
     ↓
Validator
     ↓
UI Response
```

---

# 3. Context Builder

The Context Builder collects:

* current file
* project files
* bibliography
* compiler logs
* user selection

The AI never receives unnecessary context.

---

# 4. AI Router

Purpose:

Route tasks to the best model.

Routing:

| Task             | Model  |
| ---------------- | ------ |
| Long generation  | Gemini |
| Editing          | Groq   |
| Compiler fixes   | Groq   |
| Summarization    | Gemini |
| Citation ranking | Gemini |

---

# 5. Agent: Chat Agent

Purpose:

General conversation.

Capabilities:

* Explain equations
* Explain LaTeX
* Answer research questions

Input:

```json id="agx0w1"
{
  "prompt": "...",
  "context": "..."
}
```

Output:

Markdown or LaTeX.

---

# 6. Agent: Selection Edit Agent

Trigger:

Text selected + ⌘K

Tasks:

* Rewrite
* Academic tone
* Expand
* Shorten
* Simplify

Pipeline:

Selection
↓
Instruction
↓
Groq
↓
Diff Generator
↓
User Approval

Never auto-apply edits.

---

# 7. Agent: Section Generator

Purpose:

Generate sections.

Examples:

* Introduction
* Related Work
* Abstract
* Conclusion

Model:

Gemini

Input:

Topic + existing context

Output:

Valid LaTeX.

---

# 8. Agent: Compiler Fix Agent

Trigger:

Compile failure.

Input:

Compiler logs.

Example:

```text id="h1ofz8"
Missing $ inserted
```

Pipeline:

Compiler Error
↓
Parse Error
↓
Groq
↓
Suggested Fix
↓
Diff Viewer

Capabilities:

* Missing braces
* Math mode errors
* Undefined references
* Package errors

---

# 9. Agent: Citation Agent

Goal:

Prevent hallucinated citations.

Data Sources:

* arXiv
* CrossRef

Pipeline:

Query
↓
Search API
↓
Rank Results
↓
Generate BibTeX
↓
Insert Citation

Rules:

* Always verify DOI
* Never generate fake papers

---

# 10. Agent: Table Generator

Example:

Prompt:

"Generate comparison table for RAG methods."

Output:

Valid LaTeX table.

Example:

```latex id="0jllv5"
\begin{table}
...
\end{table}
```

---

# 11. Agent: Equation Generator

Examples:

* Logistic Regression
* Bayes Theorem
* Gradient Descent

Output:

LaTeX equations.

Must validate:

* balanced braces
* math mode syntax

---

# 12. Agent: Figure Generator (Future)

Capabilities:

* TikZ generation
* Mermaid diagrams
* Flowcharts

Future model:

Multimodal Gemini

---

# 13. Prompt Templates

## Rewrite Prompt

System:

You are an academic writing assistant.

Requirements:

* Preserve meaning
* Improve clarity
* Return only LaTeX

---

## Compiler Fix Prompt

System:

You are a LaTeX debugging expert.

Input:

Compiler logs.

Return:

1. Explanation
2. Corrected code

---

## Citation Prompt

System:

Generate BibTeX only.

Never hallucinate metadata.

---

# 14. Validation Layer

Every AI output passes validation.

Checks:

* Valid LaTeX
* Balanced braces
* Forbidden commands
* Length limits

Invalid output:

Retry generation.

---

# 15. Safety Rules

Disallow:

```latex id="9hm0ub"
\write18
\input
\include
```

Prevent:

* shell execution
* filesystem access
* malicious commands

---

# 16. AI Memory

MVP:

No persistent memory.

Context only from:

* current session
* project files

Future:

Project memory.

---

# 17. Diff Engine

AI changes are shown as diffs.

User decides:

Accept

Reject

Never silently modify documents.

---

# 18. AI Latency Targets

| Task               | Target   |
| ------------------ | -------- |
| Edit               | < 3 sec  |
| Compile Fix        | < 3 sec  |
| Citation Search    | < 5 sec  |
| Section Generation | < 10 sec |

---

# 19. Cost Optimization

Use Groq whenever possible.

Use Gemini only for:

* long context
* generation
* reasoning

Cache:

* citation results
* compile fixes
* AI responses

---

# 20. Definition of Done

AI system should:

✅ Edit LaTeX

✅ Fix compile errors

✅ Generate sections

✅ Search citations

✅ Explain equations

✅ Produce valid output

Without breaking documents.
