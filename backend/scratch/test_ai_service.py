import os
import sys

# Ensure backend root is in search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from ai.ai_service import AIService

def main():
    gemini_key = os.environ.get("GEMINI_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")
    
    print("=== ENVIRONMENT CHECK ===")
    print(f"GEMINI_API_KEY: {'[FOUND]' if gemini_key else '[MISSING]'}")
    print(f"GROQ_API_KEY:   {'' if not groq_key else '[FOUND]' if len(groq_key) > 5 else '[EMPTY/INVALID]'}")
    
    service = AIService()
    print(f"Gemini Enabled: {service.gemini_provider.is_configured()}")
    print(f"Groq Enabled:   {service.groq_provider.is_configured()}")
    
    if not service.gemini_provider.is_configured() and not service.groq_provider.is_configured():
        print("\n[WARNING] No AI API keys are configured. Verification tests cannot run against live services.")
        return
        
    print("\n=== RUNNING AI SERVICE TESTS ===")
    
    # Test 1: Gemini Chat (if enabled)
    if service.gemini_provider.is_configured():
        print("\n--- Test 1: Gemini Chat ---")
        try:
            res = service.chat(
                messages=[{"role": "user", "content": "Hello! Say 'Gemini check' and nothing else."}],
                provider="gemini"
            )
            print(f"Result:\n{res}")
        except Exception as e:
            print(f"Error: {e}")

    # Test 2: Groq Chat (if enabled)
    if service.groq_provider.is_configured():
        print("\n--- Test 2: Groq Chat ---")
        try:
            res = service.chat(
                messages=[{"role": "user", "content": "Hello! Say 'Groq check' and nothing else."}],
                provider="groq"
            )
            print(f"Result:\n{res}")
        except Exception as e:
            print(f"Error: {e}")

    # Test 3: Selection Edit (using default provider)
    print("\n--- Test 3: Selection Edit (default provider) ---")
    try:
        snippet = "\\section{intro}\nThis is a simple sentence."
        instruction = "Make the section title capitalized and rewrite the sentence in an academic tone."
        res = service.edit(text=snippet, instruction=instruction)
        print(f"Input: {snippet.replace('\n', ' ')}")
        print(f"Output:\n{res}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 4: Generation (default provider)
    print("\n--- Test 4: LaTeX Generation (default provider) ---")
    try:
        prompt = "Write a basic LaTeX itemized list with three items comparing RAG models."
        res = service.generate(prompt=prompt)
        print(f"Prompt: {prompt}")
        print(f"Output:\n{res}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 5: Compiler Fix (default provider)
    print("\n--- Test 5: Compiler Error Fix (default provider) ---")
    try:
        code = "\\section{Introduction\nThis is a section with a missing brace."
        errors = "error: main.tex:1: ! File ended while scanning use of \\@xdblarg"
        res = service.fix(code=code, errors=errors)
        print(f"Explanation:\n{res.get('explanation')}")
        print(f"Fixed Code:\n{res.get('fixed_code')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
