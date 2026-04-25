import sqlite3
import json
import os
from typing import Dict, Any

class SQLiteCache:
    def __init__(self):
        self.db_path = ":memory:" # Using in-memory SQLite for true zero-latency caching
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self):
        cursor = self.conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS config_cache (
            key TEXT PRIMARY KEY,
            value TEXT
        )''')
        self.conn.commit()

    def set(self, key: str, value: Any):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO config_cache (key, value) VALUES (?, ?)", 
            (key, json.dumps(value))
        )
        self.conn.commit()

    def get(self, key: str) -> Any:
        cursor = self.conn.cursor()
        cursor.execute("SELECT value FROM config_cache WHERE key = ?", (key,))
        row = cursor.fetchone()
        if row:
            return json.loads(row['value'])
        return None

db_cache = SQLiteCache()
