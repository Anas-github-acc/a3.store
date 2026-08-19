import sqlite3
import threading
import zlib

try:
    from interfaces import StorageBackend
except ImportError:
    from app.interfaces import StorageBackend


class SQLiteStorage(StorageBackend):
    def __init__(self, db_path):
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
        conn.execute("PRAGMA busy_timeout=5000;")
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

    def put(self, key: str, value: str, modified_at: int) -> bool:
        conn = self._conn()
        cur = conn.cursor()

        cur.execute("BEGIN IMMEDIATE")
        try:
            cur.execute(
                "SELECT modified_at FROM kv WHERE key = ?",
                (key,)
            )

            row = cur.fetchone()

            if row and row[0] >= modified_at:
                cur.execute("COMMIT")
                return False

            cur.execute(
                """
                REPLACE INTO kv
                (key, value, modified_at)
                VALUES (?, ?, ?)
                """,
                (key, value, modified_at)
            )

            cur.execute("COMMIT")
            return True

        except Exception:
            cur.execute("ROLLBACK")
            raise

    def get(self, key: str):
        conn = self._conn()
        cur = conn.cursor()

        cur.execute(
            "SELECT value, modified_at FROM kv WHERE key = ?",
            (key,)
        )

        row = cur.fetchone()

        return (row[0], row[1]) if row else (None, 0)

    def scan_chunk_with_ts(
        self,
        chunk_id: int,
        chunk_count: int
    ):
        conn = self._conn()
        cur = conn.cursor()

        cur.execute(
            "SELECT key, value, modified_at FROM kv"
        )

        for key, value, modified_at in cur.fetchall():
            hashed_key = zlib.crc32(
                key.encode("utf-8")
            )

            if hashed_key % chunk_count == chunk_id:
                yield (
                    key,
                    value,
                    modified_at or 0
                )


Storage = SQLiteStorage
