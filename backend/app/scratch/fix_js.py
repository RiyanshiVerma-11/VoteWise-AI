import os

file_path = r"d:\Riyanshi\01_coding\projects\24 VoteWise AI\frontend\js\votewise_core.js"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The pattern is:
# 117:             }
# 118:         };
# 119:   },
# 120:             bn: {

# We want to remove from 119 to 150 (inclusive, 1-indexed)
# In 0-indexed, that's lines[118:150]

if "  }," in lines[118] and "bn:" in lines[119]:
    new_lines = lines[:118] + lines[150:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("SUCCESS")
else:
    print("PATTERN_NOT_FOUND")
    # Print the lines without special chars to avoid encoding error
    print(f"L118: {lines[117].strip()}")
    print(f"L119: {lines[118].strip()}")
    print(f"L120: {lines[119].split(':')[0].strip()}")
