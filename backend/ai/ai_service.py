import re
import json
import logging
from typing import List, Dict, Tuple, Any, Optional

from .rag_service import RAGService
from .providers import GroqProvider, GeminiProvider

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.groq_provider = GroqProvider()
        self.gemini_provider = GeminiProvider()

    def get_provider(self, provider_name: str):
        if provider_name == "groq" and self.groq_provider.is_configured():
            return self.groq_provider
        elif provider_name == "gemini" and self.gemini_provider.is_configured():
            return self.gemini_provider
            
        # Fallbacks
        if self.groq_provider.is_configured():
            return self.groq_provider
        if self.gemini_provider.is_configured():
            return self.gemini_provider
            
        raise ValueError("No AI providers are configured. Please set GROQ_API_KEY or GEMINI_API_KEY.")

    def chat(self, 
             messages: List[Dict[str, str]], 
             system_prompt: Optional[str] = None, 
             project_id: Optional[str] = None, 
             file_id: Optional[str] = None,
             provider: str = "gemini",
             model_name: Optional[str] = None,
             temperature: float = 0.7) -> Tuple[str, bool, Optional[str]]:
        
        if not system_prompt:
            system_prompt = (
                "You are Papr, a highly capable AI personal assistant specialized in LaTeX document creation and analysis. "
                "Your role is to deeply analyze the user's conversation, review the chat history, read the active files, and understand their intent. "
                "Draft professional, well-structured, and aesthetic LaTeX reports tailored precisely to what the user wants. "
                "Be proactive, insightful, and maintain a helpful, conversational persona while keeping your technical output rigorous.\n\n"
                "CRITICAL INSTRUCTIONS:\n"
                "1. Always escape special LaTeX characters correctly (e.g., \\%, \\&, \\$, \\#) unless they are part of a macro or math environment.\n"
                "2. When generating mathematical equations, prefer standard `amsmath` environments (e.g., \\begin{equation}, \\begin{align}).\n"
                "3. When generating tables, use modern, aesthetic styling, preferably with `booktabs` (e.g., \\toprule, \\midrule, \\bottomrule).\n"
                "4. When using the `update_active_document` tool, you MUST output the entire LaTeX file content.\n\n"
                "CHAIN OF THOUGHT REASONING:\n"
                "Before outputting any code or using any tools, you MUST wrap your reasoning in a <thought_process> XML block. "
                "Analyze the user's request, the structure of the active document, and plan your exact edits to ensure there are no missing braces `{}` or unclosed environments.\n\n"
                "EXAMPLE OUTPUT FORMAT:\n"
                "<thought_process>\n"
                "The user wants to add a table comparing RAG models. I will use the `update_active_document` tool to insert the `table` and `tabular` environments with `booktabs` for aesthetic formatting.\n"
                "</thought_process>\n"
                "If no document changes are needed, simply reply to the user.\n\n"
                "TOOL CALLING INSTRUCTIONS:\n"
                "To modify the document, you MUST invoke the `update_active_document` function via the API. "
                "DO NOT output raw LaTeX without using the tool wrapper."
            )

        if project_id:
            rag_context = RAGService.build_context(project_id)
            if rag_context:
                system_prompt += rag_context

        selected_provider = self.get_provider(provider)
        
        return selected_provider.chat(
            messages=messages,
            system_prompt=system_prompt,
            project_id=project_id,
            file_id=file_id,
            model_name=model_name,
            temperature=temperature
        )

    def edit(self, text: str, instruction: str, context: Optional[str] = None, provider: str = "groq", model_name: Optional[str] = None) -> str:
        """
        Takes a selected LaTeX snippet and an instruction, and returns the modified snippet.
        Uses lower temperature (0.1) for precise edits.
        """
        system_prompt = (
            "You are an expert LaTeX editor. You will be provided with a snippet of LaTeX code "
            "and instructions on how to modify it. Return ONLY the updated LaTeX code. "
            "Do not wrap it in markdown formatting (like ```latex) and do not provide any explanations."
        )

        prompt = f"Original LaTeX code:\n{text}\n\nInstructions: {instruction}"
        if context:
            prompt += f"\n\nContext:\n{context}"
            
        messages = [{"role": "user", "content": prompt}]
        
        selected_provider = self.get_provider(provider)
        response, _, _ = selected_provider.chat(
            messages=messages, 
            system_prompt=system_prompt, 
            model_name=model_name,
            temperature=0.1
        )

        # Clean any accidental code block wraps
        if response.startswith("```latex"):
            response = response[8:]
        elif response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]

        return response.strip()

    def generate(self, prompt: str, provider: str = "groq", model_name: Optional[str] = None) -> str:
        """
        Generates LaTeX code from scratch based on a prompt.
        Uses higher temperature (0.8) for creative generation.
        """
        system_prompt = (
            "You are an expert LaTeX generator. Return ONLY the raw LaTeX code requested by the user. "
            "Do not wrap it in markdown formatting (like ```latex) and do not provide any explanations."
        )

        messages = [{"role": "user", "content": prompt}]
        
        selected_provider = self.get_provider(provider)
        response, _, _ = selected_provider.chat(
            messages=messages, 
            system_prompt=system_prompt, 
            model_name=model_name,
            temperature=0.8
        )

        # Clean any accidental code block wraps
        if response.startswith("```latex"):
            response = response[8:]
        elif response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]

        return response.strip()

    def fix(self, code: str, errors: str, provider: str = "groq", model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyzes a compilation error log and suggests a fix.
        Uses temperature 0.0 for deterministic debugging.
        Returns a dictionary with 'explanation' and 'fixed_code'.
        """
        system_prompt = (
            "You are a LaTeX debugging agent. Given a LaTeX snippet and compilation error logs, "
            "analyze the error. You MUST return a JSON object containing precisely two keys: "
            "\"explanation\" (a short plain text description of the error and how to fix it) and "
            "\"fixed_code\" (the fully corrected LaTeX snippet). "
            "Return ONLY the raw JSON object. Do not format it with markdown code blocks (e.g. ```json)."
        )

        prompt = f"LaTeX Snippet:\n{code}\n\nCompiler Error Logs:\n{errors}"
        messages = [{"role": "user", "content": prompt}]
        
        selected_provider = self.get_provider(provider)
        response, _, _ = selected_provider.chat(
            messages=messages, 
            system_prompt=system_prompt, 
            model_name=model_name,
            temperature=0.0
        )

        cleaned_response = response.strip()
        
        # Robust JSON extraction via regex
        match = re.search(r'\{.*\}', cleaned_response, re.S)
        if match:
            cleaned_response = match.group(0)

        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.exception(f"Failed to parse JSON in fix response: {cleaned_response}")
            return {
                "explanation": "Failed to parse the AI's fix recommendation due to invalid formatting.",
                "fixed_code": code
            }
