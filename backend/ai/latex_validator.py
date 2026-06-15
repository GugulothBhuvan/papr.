import re
from typing import Optional

class LatexValidator:
    @staticmethod
    def verify_syntax(code: str) -> Optional[str]:
        """
        Validates basic LaTeX syntax using a stack-based approach.
        Checks for matching braces, environment nesting, and math mode closures.
        Returns an error string if invalid, or None if valid.
        """
        brace_stack = []
        env_stack = []
        math_mode = None  # can be '$', '$$', r'\[', or r'\('
        
        i = 0
        n = len(code)
        
        while i < n:
            # Handle escapes
            if code[i] == '\\':
                if i + 1 < n:
                    # Check environments
                    if code.startswith(r'\begin{', i):
                        end_idx = code.find('}', i + 7)
                        if end_idx != -1:
                            env = code[i+7:end_idx]
                            env_stack.append(env)
                            i = end_idx  # Skip over the begin block
                        else:
                            return r"Malformed \begin command missing closing brace."
                    elif code.startswith(r'\end{', i):
                        end_idx = code.find('}', i + 5)
                        if end_idx != -1:
                            env = code[i+5:end_idx]
                            if not env_stack:
                                return f"Unmatched end environment: \\end{{{env}}} with no open environment."
                            expected_env = env_stack.pop()
                            if expected_env != env:
                                return f"Environment mismatch: Expected \\end{{{expected_env}}} but found \\end{{{env}}}."
                            i = end_idx
                        else:
                            return r"Malformed \end command missing closing brace."
                    elif code.startswith(r'\[', i) or code.startswith(r'\(', i):
                        tag = code[i:i+2]
                        if not math_mode:
                            math_mode = tag
                        elif math_mode == tag:
                            pass # allow nesting of the same if it happens, though technically invalid in strict LaTeX
                        i += 1
                    elif code.startswith(r'\]', i):
                        if math_mode == r'\[':
                            math_mode = None
                        elif math_mode is None:
                            return r"Unmatched closing math bracket \]"
                        i += 1
                    elif code.startswith(r'\)', i):
                        if math_mode == r'\(':
                            math_mode = None
                        elif math_mode is None:
                            return r"Unmatched closing math bracket \)"
                        i += 1
                    else:
                        i += 1 # skip the escaped character (e.g. \{ or \})
            else:
                if code[i] == '{':
                    brace_stack.append('{')
                elif code[i] == '}':
                    if not brace_stack:
                        return "Unmatched closing brace '}'."
                    brace_stack.pop()
                elif code[i] == '$':
                    if i + 1 < n and code[i+1] == '$':
                        # $$
                        if math_mode == '$$':
                            math_mode = None
                        elif math_mode is None:
                            math_mode = '$$'
                        i += 1 # skip second $
                    else:
                        # single $
                        if math_mode == '$':
                            math_mode = None
                        elif math_mode is None:
                            math_mode = '$'
            i += 1
            
        if brace_stack:
            return "Unclosed brace '{'."
        if env_stack:
            return f"Unclosed environment: \\begin{{{env_stack[-1]}}}."
        if math_mode:
            return f"Unclosed math environment: {math_mode}."
            
        return None
