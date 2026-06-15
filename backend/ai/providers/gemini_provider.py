import os
import logging
from typing import List, Dict, Tuple, Optional
import google.generativeai as genai
from .base import BaseProvider
from ..latex_validator import LatexValidator

logger = logging.getLogger(__name__)

GEMINI_MODELS = {
    "gemini-2.5-flash",
    "gemini-2.5-pro"
}

class GeminiProvider(BaseProvider):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.enabled = bool(self.api_key)
        if self.enabled:
            genai.configure(api_key=self.api_key)

    def is_configured(self) -> bool:
        return self.enabled

    def chat(self, 
             messages: List[Dict[str, str]], 
             system_prompt: str, 
             project_id: Optional[str] = None, 
             file_id: Optional[str] = None, 
             model_name: Optional[str] = None,
             temperature: float = 0.7) -> Tuple[str, bool, Optional[str]]:
             
        if not self.is_configured():
            raise ValueError("Gemini API key is not configured.")

        gemini_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            if role == "assistant":
                role = "model"
            gemini_messages.append({"role": role, "parts": [msg.get("content", "")]})

        actual_model_name = model_name if model_name in GEMINI_MODELS else "gemini-2.5-flash"
        
        gemini_tools = None
        if project_id and file_id:
            # We define a dummy function just for the schema, since we just want the arguments.
            def update_active_document(new_latex_content: str):
                """Drafts new LaTeX content for the active document. The system will prompt the user to apply it."""
                pass
            
            gemini_tools = [update_active_document]

        model = genai.GenerativeModel(
            model_name=actual_model_name,
            system_instruction=system_prompt,
            tools=gemini_tools
        )

        try:
            response = model.generate_content(
                gemini_messages,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                ),
            )
            
            final_text = ""
            new_content = None
            file_updated = False
            
            if response.parts:
                for part in response.parts:
                    if part.text:
                        final_text += part.text
                    elif part.function_call:
                        if part.function_call.name == "update_active_document":
                            args = dict(part.function_call.args)
                            new_content = args.get("new_latex_content", "")
                            
                            error = LatexValidator.verify_syntax(new_content)
                            if error:
                                logger.warning(f"Heuristic Validation Failed: {error}")
                                final_text += f"\n\n[System Warning: Heuristic check failed: {error} Please review carefully.]"
                                
                            file_updated = True
                            
            if file_updated:
                if not final_text:
                    final_text = "I have prepared the document updates for your review."
                else:
                    final_text += "\nI have prepared the document updates for your review."
                    
            return final_text.strip(), file_updated, new_content
        except Exception:
            logger.exception("Gemini call failed")
            return "I apologize, but I encountered an error preparing the response. Please try rephrasing your request.", False, None
