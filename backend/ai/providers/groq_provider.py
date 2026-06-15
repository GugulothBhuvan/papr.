import os
import json
import re
import logging
from typing import List, Dict, Tuple, Optional
from groq import Groq
from .base import BaseProvider
from ..latex_validator import LatexValidator

logger = logging.getLogger(__name__)

GROQ_MODELS = {
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
}

class GroqProvider(BaseProvider):
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.enabled = bool(self.api_key)
        if self.enabled:
            self.client = Groq(api_key=self.api_key)

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
            raise ValueError("Groq API key is not configured.")

        # Format roles for Groq: system, user, assistant
        groq_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            role = msg.get("role", "user")
            if role == "model":
                role = "assistant"
            groq_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })

        actual_model_name = model_name if model_name in GROQ_MODELS else "llama-3.3-70b-versatile"
        
        groq_tools = None
        if project_id and file_id:
            groq_tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "update_active_document",
                        "description": "Drafts new LaTeX content for the active document. The system will prompt the user to apply it.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "new_latex_content": {
                                    "type": "string",
                                    "description": "The updated fully-escaped LaTeX content.",
                                }
                            },
                            "required": ["new_latex_content"],
                        },
                    },
                }
            ]

        kwargs = {
            "model": actual_model_name,
            "messages": groq_messages,
            "temperature": temperature,
        }
        if groq_tools:
            kwargs["tools"] = groq_tools
            kwargs["tool_choice"] = "auto"

        try:
            return self._execute_call(kwargs)
        except Exception as e:
            logger.warning(f"Primary Groq call failed with {actual_model_name}: {e}")
            # Fallback to llama-3.1-8b-instant without tools
            try:
                kwargs["model"] = "llama-3.1-8b-instant"
                if "tools" in kwargs:
                    del kwargs["tools"]
                if "tool_choice" in kwargs:
                    del kwargs["tool_choice"]
                
                final_text, _, _ = self._execute_call(kwargs)
                final_text += "\n\n[System Note: Document editing was disabled due to a model generation failure. Please try again.]"
                return final_text, False, None
            except Exception as inner_e:
                logger.exception("Fallback Groq call also failed")
                return "I apologize, but I encountered an error preparing the response. Please try rephrasing your request.", False, None

    def _execute_call(self, kwargs: dict) -> Tuple[str, bool, Optional[str]]:
        completion = self.client.chat.completions.create(**kwargs)
        message = completion.choices[0].message
        
        final_text = message.content or ""
        
        # Strip hallucinated tags if they leak
        if "<new_latex_content>" in final_text:
            final_text = re.sub(r'<new_latex_content>.*?(</new_latex_content>)?', '', final_text, flags=re.DOTALL).strip()

        file_updated = False
        new_content = None
        
        if message.tool_calls:
            for tool_call in (message.tool_calls or []):
                if tool_call.function.name == "update_active_document":
                    try:
                        args = json.loads(tool_call.function.arguments)
                        new_content = args.get("new_latex_content", "")
                        
                        error = LatexValidator.verify_syntax(new_content)
                        if error:
                            logger.warning(f"Heuristic Validation Failed: {error}")
                            final_text += f"\n\n[System Warning: Heuristic check failed: {error} Please review carefully before applying.]"
                            
                        file_updated = True
                        if not final_text:
                            final_text = "I have prepared the document updates for your review."
                        else:
                            final_text += "\nI have prepared the document updates for your review."
                    except json.JSONDecodeError:
                        logger.exception("Invalid tool JSON generated by model.")
                        final_text += "\n\n[System Warning: Failed to parse document updates due to invalid JSON generation.]"
                        
        return final_text.strip(), file_updated, new_content
