from abc import ABC, abstractmethod
from typing import Iterable


class StorageBackend(ABC):

    @abstractmethod
    def put(self, key: str, value: str, modified_at: int) -> bool:
        pass

    @abstractmethod
    def get(self, key: str):
        pass

    @abstractmethod
    def scan_chunk_with_ts(
        self,
        chunk_id: int,
        chunk_count: int
    ) -> Iterable:
        pass


class PeerClient(ABC):

    @abstractmethod
    def replicate(
        self,
        peer_addr: str,
        key: str,
        value: str,
        modified_at: int,
        timeout: int = 2
    ):
        pass

    @abstractmethod
    def get(
        self,
        peer_addr: str,
        key: str,
        timeout: int = 2
    ):
        pass

    @abstractmethod
    def get_chunk_hash(
        self,
        peer_addr: str,
        chunk_id: int,
        timeout: int = 5
    ):
        pass

    @abstractmethod
    def fetch_range(
        self,
        peer_addr: str,
        chunk_id: int,
        timeout: int = 10
    ):
        pass
