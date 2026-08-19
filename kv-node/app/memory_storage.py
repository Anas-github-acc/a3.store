import zlib
from typing import Iterable

try:
    from interfaces import StorageBackend
except ImportError:
    from app.interfaces import StorageBackend


class InMemoryStorage(StorageBackend):

    def __init__(self):
        self.data = {}

    def put(self, key: str, value: str, modified_at: int) -> bool:
        current = self.data.get(key)

        if current and current[1] >= modified_at:
            return False

        self.data[key] = (
            value,
            modified_at
        )

        return True

    def get(self, key: str):
        return self.data.get(
            key,
            (None, 0)
        )

    def scan_chunk_with_ts(
        self,
        chunk_id: int,
        chunk_count: int
    ) -> Iterable:
        for key, (value, modified_at) in self.data.items():
            hashed_key = zlib.crc32(
                key.encode("utf-8")
            )

            if hashed_key % chunk_count == chunk_id:
                yield (
                    key,
                    value,
                    modified_at
                )
