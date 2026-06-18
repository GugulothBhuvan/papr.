import os
import subprocess
import shutil
import uuid
import re
import time
from typing import List, Dict, Any, Tuple
from services import storage

import platform

def get_tectonic_path():
    # 1. Check if tectonic is in system PATH
    system_tectonic = shutil.which("tectonic")
    if system_tectonic:
        return system_tectonic
        
    # 2. Fallback to local bin directory
    bin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin"))
    if platform.system() == "Windows":
        return os.path.join(bin_dir, "tectonic.exe")
    else:
        return os.path.join(bin_dir, "tectonic")

TECTONIC_BIN = get_tectonic_path()

def parse_tectonic_errors(log_content: str) -> List[Dict[str, Any]]:
    r"""
    Parses Tectonic compile log output to find LaTeX errors and map them to line numbers.
    Example log patterns:
    ! Undefined control sequence.
    l.42 \invalidcommand
    """
    errors = []
    lines = log_content.splitlines()
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for standard LaTeX error symbol '!'
        if line.startswith("!"):
            error_msg = line[1:].strip()
            line_num = 1
            context = ""
            
            # Scan subsequent lines (up to 5) to find line number 'l.XX'
            for j in range(1, 6):
                if i + j < len(lines):
                    next_line = lines[i + j]
                    match = re.match(r"^l\.(\d+)", next_line.strip())
                    if match:
                        line_num = int(match.group(1))
                        context = next_line[match.end():].strip()
                        break
            
            errors.append({
                "line": line_num,
                "error": error_msg,
                "context": context,
                "file": "main.tex" # Default to main.tex in MVP
            })
            
        # Check for generic Tectonic/Rust errors
        elif line.startswith("error:"):
            # Don't duplicate if already added
            error_msg = line[6:].strip()
            # Try to see if there is line number info in the error message
            line_match = re.search(r"line\s+(\d+)", error_msg, re.IGNORECASE)
            line_num = int(line_match.group(1)) if line_match else 1
            
            errors.append({
                "line": line_num,
                "error": error_msg,
                "context": "",
                "file": "main.tex"
            })
            
        i += 1
        
    return errors


def compile_project(project_id: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Copies project files into a temporary directory, runs Tectonic,
    and returns (success, details) containing logs, errors, and compile time.
    """
    p_dir = storage.get_project_dir(project_id)
    if not os.path.exists(p_dir):
        return False, {"error": "Project folder not found"}
        
    # 1. Create a unique temp folder to compile
    temp_id = str(uuid.uuid4())
    temp_dir = os.path.join(p_dir, f"temp_build_{temp_id}")
    os.makedirs(temp_dir, exist_ok=True)
    
    # 2. Copy project files recursively (excluding temp directories and old PDF output)
    try:
        for item in os.listdir(p_dir):
            if item.startswith("temp_build_") or item == "output.pdf":
                continue
            s = os.path.join(p_dir, item)
            d = os.path.join(temp_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return False, {"error": f"Failed to clone files: {str(e)}"}
        
    # 3. Check for main file
    main_file = "main.tex"
    main_path = os.path.join(temp_dir, main_file)
    if not os.path.exists(main_path):
        shutil.rmtree(temp_dir, ignore_errors=True)
        return False, {"error": "main.tex not found in project root"}
        
    # 4. Check if Tectonic binary exists
    if not os.path.exists(TECTONIC_BIN):
        shutil.rmtree(temp_dir, ignore_errors=True)
        return False, {"error": "Tectonic compiler executable not found. Please install it first."}
        
    # 5. Run Tectonic compilation
    # Command: tectonic main.tex
    start_time = time.time()
    try:
        # Tectonic command will output a PDF named 'main.pdf' in the temp dir
        result = subprocess.run(
            [TECTONIC_BIN, main_file],
            cwd=temp_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120 # 120 seconds compile limit
        )
        compile_time = round(time.time() - start_time, 2)
        
        # Collect stdout and stderr combined
        logs = result.stdout + "\n" + result.stderr
        
        # 6. Check for success
        temp_pdf = os.path.join(temp_dir, "main.pdf")
        pdf_created = os.path.exists(temp_pdf)
        success = pdf_created
        
        errors = []
        parsed_errors = parse_tectonic_errors(logs)
        
        if not success:
            errors = parsed_errors
            if not errors:
                errors.append({
                    "line": 1,
                    "error": "Compilation failed. No PDF output generated. Check raw logs.",
                    "context": "",
                    "file": "main.tex"
                })
        else:
            # Copy generated PDF back to the project root as output.pdf
            dest_pdf = os.path.join(p_dir, "output.pdf")
            shutil.copy2(temp_pdf, dest_pdf)
            errors = parsed_errors
            
        return success, {
            "success": success,
            "compile_time": compile_time,
            "logs": logs,
            "errors": errors,
            "pdf_url": f"/api/projects/{project_id}/pdf" if success else None
        }
        
    except subprocess.TimeoutExpired:
        return False, {
            "success": False,
            "compile_time": 120.0,
            "logs": "Compilation timed out after 120 seconds.",
            "errors": [{"line": 1, "error": "Compilation timed out", "context": "", "file": "main.tex"}]
        }
    except Exception as e:
        return False, {
            "success": False,
            "compile_time": 0.0,
            "logs": f"Subprocess exception: {str(e)}",
            "errors": [{"line": 1, "error": str(e), "context": "", "file": "main.tex"}]
        }
    finally:
        # 7. Clean up temp folder
        shutil.rmtree(temp_dir, ignore_errors=True)
