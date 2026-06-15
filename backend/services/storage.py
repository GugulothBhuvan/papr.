import os
import uuid
import shutil
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage"))
PROJECTS_DIR = os.path.join(STORAGE_DIR, "projects")

# Templates definition
TEMPLATES = {
    "Blank": {
        "main.tex": r"""\documentclass{article}
\usepackage{graphicx}

\title{Your Document Title}
\author{Author Name}
\date{\today}

\begin{document}

\maketitle

\section{Introduction}
Start writing your document here.

\end{document}
""",
        "references.bib": ""
    },
    "IEEE": {
        "main.tex": r"""\documentclass[conference]{IEEEtran}
\usepackage{cite}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{algorithmic}
\usepackage{graphicx}
\usepackage{textcomp}
\usepackage{xcolor}

\begin{document}

\title{Paper Title*}

\author{\IEEEauthorblockN{Author Name}
\IEEEauthorblockA{\textit{Department} \\
\textit{Organization}\\
City, Country \\
email@example.com}}

\maketitle

\begin{abstract}
This is the abstract for the IEEE paper.
\end{abstract}

\begin{IEEEkeywords}
component, formatting, style, styling, insert
\end{IEEEkeywords}

\section{Introduction}
Introduce your work here.

\bibliographystyle{IEEEtran}
\bibliography{references}

\end{document}
""",
        "references.bib": ""
    },
    "ACM": {
        "main.tex": r"""\documentclass[sigconf]{acmart}

\title{The Title of the Paper}

\author{Author Name}
\affiliation{%
  \institution{Institution}
  \city{City}
  \country{Country}
}
\email{email@example.com}

\begin{abstract}
This is the abstract for the ACM paper.
\end{abstract}

\begin{document}

\maketitle

\section{Introduction}
Introduction section content.

\bibliographystyle{ACM-Reference-Format}
\bibliography{references}

\end{document}
""",
        "references.bib": ""
    },
    "Thesis": {
        "main.tex": r"""\documentclass[12pt]{report}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}

\title{Thesis Title}
\author{Author Name}
\date{\today}

\begin{document}

\maketitle

\tableofcontents

\chapter{Introduction}
Introductory chapter.

\bibliographystyle{plain}
\bibliography{references}

\end{document}
""",
        "references.bib": ""
    }
}


def ensure_storage_dirs():
    os.makedirs(PROJECTS_DIR, exist_ok=True)


def get_project_dir(project_id: str) -> str:
    # Basic input sanitation
    safe_id = str(uuid.UUID(project_id))
    return os.path.join(PROJECTS_DIR, safe_id)


def safe_resolve_path(project_dir: str, file_path: str) -> str:
    """Resolves path and ensures it lies within the project directory."""
    resolved_path = os.path.abspath(os.path.join(project_dir, file_path))
    if not resolved_path.startswith(os.path.abspath(project_dir)):
        raise ValueError("Directory traversal attempt detected")
    return resolved_path


def read_metadata(project_dir: str) -> Dict[str, Any]:
    meta_path = os.path.join(project_dir, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def write_metadata(project_dir: str, metadata: Dict[str, Any]):
    meta_path = os.path.join(project_dir, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)


def list_projects() -> List[Dict[str, Any]]:
    ensure_storage_dirs()
    projects = []
    for pid in os.listdir(PROJECTS_DIR):
        p_dir = os.path.join(PROJECTS_DIR, pid)
        if os.path.isdir(p_dir):
            try:
                meta = read_metadata(p_dir)
                projects.append({
                    "id": pid,
                    "name": meta.get("name", "Untitled"),
                    "template": meta.get("template", "Blank"),
                    "created_at": meta.get("created_at"),
                    "updated_at": meta.get("updated_at")
                })
            except Exception:
                # Skip invalid project directories
                continue
    return projects


def create_project(name: str, template: str = "Blank") -> str:
    ensure_storage_dirs()
    project_id = str(uuid.uuid4())
    p_dir = os.path.join(PROJECTS_DIR, project_id)
    os.makedirs(p_dir)

    # Subfolders
    os.makedirs(os.path.join(p_dir, "figures"), exist_ok=True)
    os.makedirs(os.path.join(p_dir, "sections"), exist_ok=True)

    files_list = []
    tpl = TEMPLATES.get(template, TEMPLATES["Blank"])

    for rel_path, content in tpl.items():
        file_id = str(uuid.uuid4())
        abs_path = os.path.join(p_dir, rel_path)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        files_list.append({
            "id": file_id,
            "filename": os.path.basename(rel_path),
            "path": rel_path,
            "file_type": rel_path.split(".")[-1]
        })

    now = datetime.utcnow().isoformat()
    meta = {
        "id": project_id,
        "name": name,
        "template": template,
        "main_file": "main.tex",
        "created_at": now,
        "updated_at": now,
        "files": files_list
    }
    write_metadata(p_dir, meta)
    return project_id


def get_project(project_id: str) -> Dict[str, Any]:
    p_dir = get_project_dir(project_id)
    if not os.path.exists(p_dir):
        raise FileNotFoundError("Project not found")
    meta = read_metadata(p_dir)
    return meta


def delete_project(project_id: str):
    p_dir = get_project_dir(project_id)
    if os.path.exists(p_dir):
        shutil.rmtree(p_dir)


def list_files(project_id: str) -> List[Dict[str, Any]]:
    meta = get_project(project_id)
    return meta.get("files", [])


def create_file(project_id: str, filename: str, content: str = "", path_prefix: str = "") -> Dict[str, Any]:
    p_dir = get_project_dir(project_id)
    meta = read_metadata(p_dir)

    rel_path = os.path.join(path_prefix, filename).replace("\\", "/")
    # Remove leading slashes
    if rel_path.startswith("/"):
        rel_path = rel_path[1:]

    abs_path = safe_resolve_path(p_dir, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)

    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(content)

    # Add to metadata files list if it doesn't exist
    files_list = meta.get("files", [])
    existing = next((f for f in files_list if f["path"] == rel_path), None)
    
    if existing:
        file_meta = existing
    else:
        file_meta = {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "path": rel_path,
            "file_type": filename.split(".")[-1] if "." in filename else ""
        }
        files_list.append(file_meta)
        meta["files"] = files_list
        meta["updated_at"] = datetime.utcnow().isoformat()
        write_metadata(p_dir, meta)

    return file_meta


def get_file_by_id(project_id: str, file_id: str) -> Dict[str, Any]:
    p_dir = get_project_dir(project_id)
    meta = read_metadata(p_dir)
    files_list = meta.get("files", [])
    file_info = next((f for f in files_list if f["id"] == file_id), None)
    if not file_info:
        raise FileNotFoundError("File not found in project metadata")
    return file_info


def read_file_content(project_id: str, file_id: str) -> str:
    p_dir = get_project_dir(project_id)
    file_info = get_file_by_id(project_id, file_id)
    abs_path = safe_resolve_path(p_dir, file_info["path"])
    
    with open(abs_path, "r", encoding="utf-8") as f:
        return f.read()


def update_file_content(project_id: str, file_id: str, content: str):
    p_dir = get_project_dir(project_id)
    file_info = get_file_by_id(project_id, file_id)
    abs_path = safe_resolve_path(p_dir, file_info["path"])
    
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    meta = read_metadata(p_dir)
    meta["updated_at"] = datetime.utcnow().isoformat()
    write_metadata(p_dir, meta)


def delete_file(project_id: str, file_id: str):
    p_dir = get_project_dir(project_id)
    meta = read_metadata(p_dir)
    files_list = meta.get("files", [])
    
    file_info = next((f for f in files_list if f["id"] == file_id), None)
    if not file_info:
        raise FileNotFoundError("File not found")
        
    abs_path = safe_resolve_path(p_dir, file_info["path"])
    if os.path.exists(abs_path):
        if os.path.isdir(abs_path):
            shutil.rmtree(abs_path)
        else:
            os.remove(abs_path)
            
    # Update files list
    new_files_list = [f for f in files_list if f["id"] != file_id]
    meta["files"] = new_files_list
    meta["updated_at"] = datetime.utcnow().isoformat()
    write_metadata(p_dir, meta)


def rename_project(project_id: str, new_name: str):
    p_dir = get_project_dir(project_id)
    if not os.path.exists(p_dir):
        raise FileNotFoundError("Project not found")
    meta = read_metadata(p_dir)
    meta["name"] = new_name
    meta["updated_at"] = datetime.utcnow().isoformat()
    write_metadata(p_dir, meta)
