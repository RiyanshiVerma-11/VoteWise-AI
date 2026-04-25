import json
import os

config_path = r'd:\Riyanshi\01_coding\projects\24 VoteWise AI\backend\app\data\election_config.json'
try:
    with open(config_path, 'r', encoding='utf-8') as f:
        json.load(f)
    print("SUCCESS: JSON is valid")
except Exception as e:
    print(f"FAILURE: JSON is invalid: {e}")
