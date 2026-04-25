import sys

def check_braces(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    for i, char in enumerate(content):
        if char == '{':
            stack.append(i)
        elif char == '}':
            if not stack:
                return f"Extra closing brace at index {i}"
            stack.pop()
    
    if stack:
        return f"Missing {len(stack)} closing braces"
    return "SUCCESS: Braces are balanced"

print(check_braces(r"d:\Riyanshi\01_coding\projects\24 VoteWise AI\frontend\js\votewise_core.js"))
