from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services import storage
from compiler import compiler
from ai.ai_service import AIService

app = FastAPI(
    title="Papr API",
    description="FastAPI Backend for Papr - AI LaTeX Copilot",
    version="1.0"
)

# Initialize AI Service
ai_service = AIService()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class HealthResponse(BaseModel):
    status: str

class ProjectCreate(BaseModel):
    name: str
    template: str = "Blank"

class ProjectRename(BaseModel):
    name: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    template: str
    created_at: str
    updated_at: str

class FileCreateRequest(BaseModel):
    filename: str
    content: str = ""
    path_prefix: str = ""

class FileUpdateRequest(BaseModel):
    content: str

class CompileRequest(BaseModel):
    project_id: str

class AIChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    provider: str = "gemini"
    project_id: Optional[str] = None
    active_file_id: Optional[str] = None
    model: Optional[str] = None

class AIEditRequest(BaseModel):
    text: str
    instruction: str
    context: Optional[str] = None
    provider: str = "groq"
    model: Optional[str] = None

class AIGenerateRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    provider: str = "gemini"
    model: Optional[str] = None

class AIFixRequest(BaseModel):
    code: str
    errors: str
    provider: str = "groq"
    model: Optional[str] = None

# Standard format responses
def success_response(data: Any, message: str = "Operation successful"):
    return {
        "success": True,
        "data": data,
        "message": message
    }

def error_response(code: str, message: str):
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }

# --- Routes ---

@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "healthy"}

# Projects
@app.post("/api/projects")
def create_project(req: ProjectCreate):
    try:
        project_id = storage.create_project(req.name, req.template)
        return success_response({"project_id": project_id}, "Project created successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/projects")
def list_projects():
    try:
        projects = storage.list_projects()
        return success_response(projects, "Projects retrieved successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    try:
        meta = storage.get_project(project_id)
        return success_response(meta, "Project retrieved successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    try:
        storage.delete_project(project_id)
        return success_response(None, "Project deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/api/projects/{project_id}/rename")
def rename_project(project_id: str, req: ProjectRename):
    try:
        storage.rename_project(project_id, req.name)
        return success_response(None, "Project renamed successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Files
@app.get("/api/projects/{project_id}/files")
def list_files(project_id: str):
    try:
        files = storage.list_files(project_id)
        return success_response(files, "Files listed successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/projects/{project_id}/files")
def create_file(project_id: str, req: FileCreateRequest):
    try:
        file_meta = storage.create_file(project_id, req.filename, req.content, req.path_prefix)
        return success_response(file_meta, "File created successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/projects/{project_id}/files/{file_id}/content")
def get_file_content(project_id: str, file_id: str):
    try:
        content = storage.read_file_content(project_id, file_id)
        return success_response({"content": content}, "File content retrieved successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File or Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/api/files/{file_id}")
def update_file(file_id: str, req: FileUpdateRequest, project_id: str = Query(...)):
    try:
        storage.update_file_content(project_id, file_id, req.content)
        return success_response(None, "File updated successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File or Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/api/files/{file_id}")
def delete_file(file_id: str, project_id: str = Query(...)):
    try:
        storage.delete_file(project_id, file_id)
        return success_response(None, "File deleted successfully")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File or Project not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Compile
@app.post("/api/compile")
def compile_project(req: CompileRequest):
    try:
        success, result = compiler.compile_project(req.project_id)
        if success:
            return success_response(result, "Compilation successful")
        else:
            # We return HTTP 200 with success=False, as compilation failure is a domain error, not a server exception
            return {
                "success": False,
                "error": {
                    "code": "COMPILE_FAILED",
                    "message": "LaTeX compilation failed.",
                    "details": result
                }
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/projects/{project_id}/pdf")
def get_pdf(project_id: str):
    try:
        p_dir = storage.get_project_dir(project_id)
        pdf_path = os.path.join(p_dir, "output.pdf")
        if not os.path.exists(pdf_path):
            raise FileNotFoundError("output.pdf not found")
        return FileResponse(pdf_path, media_type="application/pdf", filename="output.pdf")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF preview not generated yet. Compile the project first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# --- AI Endpoints ---

@app.post("/api/ai/chat")
def ai_chat(req: AIChatRequest):
    try:
        response_text, file_updated, new_content = ai_service.chat(
            req.messages, 
            provider=req.provider,
            project_id=req.project_id,
            file_id=req.active_file_id,
            model_name=req.model
        )
        return success_response({
            "response": response_text, 
            "file_updated": file_updated,
            "new_content": new_content
        }, "AI response generated")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/ai/edit")
def ai_edit(req: AIEditRequest):
    try:
        edited_text = ai_service.edit(req.text, req.instruction, req.context, provider=req.provider, model_name=req.model)
        return success_response({"text": edited_text}, "Selection edited successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/ai/generate")
def ai_generate(req: AIGenerateRequest):
    try:
        generated_text = ai_service.generate(req.prompt, req.context, provider=req.provider, model_name=req.model)
        return success_response({"text": generated_text}, "LaTeX content generated successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/ai/fix")
def ai_fix(req: AIFixRequest):
    try:
        fix_result = ai_service.fix(req.code, req.errors, provider=req.provider, model_name=req.model)
        return success_response(fix_result, "Compiler fix generated successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
