import sqlite3, threading

class Storage:
    def __init__(self, db_path):
        # each thread should create its own connection
        self.db_path = db_path
        self._local = threading.local()
        self._init_db()

    def _conn(self):
        if not getattr(self._local, "conn", None):
            conn = sqlite3.connect(self.db_path, check_same_thread=False, isolation_level=None)
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            self._local.conn = conn
        return self._local.conn

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS kv (
                key TEXT PRIMARY KEY,
                value TEXT,
                modified_at INTEGER
            );
        """)
        conn.commit()
        conn.close()

    def put(self, key, value, modified_at):
        conn = self._conn()
        cur = conn.cursor()
        cur.execute("BEGIN")
        cur.execute("REPLACE INTO kv (key, value, modified_at) VALUES (?, ?, ?)", (key, value, modified_at))
        cur.execute("COMMIT")

    def get(self, key):
        conn = self._conn()
        cur = conn.cursor()
        cur.execute("SELECT value FROM kv WHERE key = ?", (key,))
        row = cur.fetchone()
        return row[0] if row else None

    # def scan_chunk(self, chunk_id, chunk_count):
    #     # simple partition by hash(key) % chunk_count == chunk_id
    #     conn = self._conn()
    #     cur = conn.cursor()
    #     cur.execute("SELECT key, value FROM kv")
    #     for k, v in cur.fetchall():
    #         if (abs(hash(k)) % chunk_count) == chunk_id:
    #             yield (k, v)

    def scan_chunk_with_ts(self, chunk_id, chunk_count):
        conn = self._conn()
        cur = conn.cursor()
        cur.execute("SELECT key, value, modified_at FROM kv")
        for k, v, m in cur.fetchall():
            if (abs(hash(k)) % chunk_count) == chunk_id:
                yield (k, v, m or 0)
