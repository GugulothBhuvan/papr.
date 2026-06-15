from typing import List, Dict, Tuple, Optional
from abc import ABC, abstractmethod

class BaseProvider(ABC):
    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if API keys are configured and the provider is ready to use."""
        pass

    @abstractmethod
    def chat(self, 
             messages: List[Dict[str, str]], 
             system_prompt: str, 
             project_id: Optional[str] = None, 
             file_id: Optional[str] = None, 
             model_name: Optional[str] = None,
             temperature: float = 0.7) -> Tuple[str, bool, Optional[str]]:
        """
        Processes a chat request.
        Returns: (response_text, file_updated, new_latex_content)
        """
        pass
