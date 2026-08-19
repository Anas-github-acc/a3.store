import time
import pytest
import zlib
from unittest.mock import patch
from app.memory_storage import InMemoryStorage
from app.anti_entropy import AntiEntropyService, compute_chunk_hash, start_anti_entropy, log_ae, log_ae_event
from tests.fakes import FakePeerClient


class MockKVItem:
    def __init__(self, key, value, modified_at):
        self.key = key
        self.value = value
        self.modified_at = modified_at


def test_logging_and_events():
    with patch("app.anti_entropy.DEBUG_LOG", True):
        log_ae("Test message")
        log_ae_event("test_event", "node1", 0, keys=1, extra={"foo": "bar"})


def test_anti_entropy_same_chunk_hash():
    storage = InMemoryStorage()
    storage.put("k1", "v1", 100)

    peer_client = FakePeerClient()
    peer_addr = "127.0.0.1:50052"

    for c in range(16):
        peer_client.hashes[(peer_addr, c)] = compute_chunk_hash(storage, c)

    service = AntiEntropyService(
        storage=storage,
        peer_client=peer_client,
        peer_provider=lambda: [peer_addr],
        own_id="node-1",
        own_addr="127.0.0.1:50051"
    )

    service.process_single_peer(peer_addr)

    val, ts = storage.get("k1")
    assert val == "v1"
    assert ts == 100


def test_anti_entropy_mismatch_remote_newer():
    storage = InMemoryStorage()
    storage.put("k1", "v1_old", 50)

    peer_client = FakePeerClient()
    peer_addr = "127.0.0.1:50052"

    chunk_id = zlib.crc32("k1".encode("utf-8")) % 16

    peer_client.hashes[(peer_addr, chunk_id)] = b"different_hash_value"
    for c in range(16):
        if c != chunk_id:
            peer_client.hashes[(peer_addr, c)] = compute_chunk_hash(storage, c)

    peer_client.ranges[(peer_addr, chunk_id)] = [
        MockKVItem("k1", "v1_new", 150)
    ]

    service = AntiEntropyService(
        storage=storage,
        peer_client=peer_client,
        peer_provider=lambda: [peer_addr],
        own_id="node-1",
        own_addr="127.0.0.1:50051"
    )

    service.process_single_peer(peer_addr)

    val, ts = storage.get("k1")
    assert val == "v1_new"
    assert ts == 150


def test_anti_entropy_mismatch_remote_older():
    storage = InMemoryStorage()
    storage.put("k1", "v1_new", 200)

    peer_client = FakePeerClient()
    peer_addr = "127.0.0.1:50052"

    chunk_id = zlib.crc32("k1".encode("utf-8")) % 16

    peer_client.hashes[(peer_addr, chunk_id)] = b"different_hash_value"
    for c in range(16):
        if c != chunk_id:
            peer_client.hashes[(peer_addr, c)] = compute_chunk_hash(storage, c)

    peer_client.ranges[(peer_addr, chunk_id)] = [
        MockKVItem("k1", "v1_old", 100)
    ]

    service = AntiEntropyService(
        storage=storage,
        peer_client=peer_client,
        peer_provider=lambda: [peer_addr],
        own_id="node-1",
        own_addr="127.0.0.1:50051"
    )

    service.process_single_peer(peer_addr)

    val, ts = storage.get("k1")
    assert val == "v1_new"
    assert ts == 200


def test_anti_entropy_rpc_exception_survival():
    storage = InMemoryStorage()
    peer_client = FakePeerClient()
    peer_addr = "127.0.0.1:50052"

    peer_client.hashes[(peer_addr, 0)] = Exception("RPC Network Timeout")

    service = AntiEntropyService(
        storage=storage,
        peer_client=peer_client,
        peer_provider=lambda: [peer_addr],
        own_id="node-1",
        own_addr="127.0.0.1:50051"
    )

    service.process_single_peer(peer_addr)


def test_anti_entropy_no_peers():
    storage = InMemoryStorage()
    peer_client = FakePeerClient()

    service = AntiEntropyService(
        storage=storage,
        peer_client=peer_client,
        peer_provider=lambda: [],
        own_id="node-1",
        own_addr="127.0.0.1:50051"
    )

    service.run_sync_round()


def test_anti_entropy_start_service_thread():
    storage = InMemoryStorage()
    peer_client = FakePeerClient()

    service = start_anti_entropy(storage, lambda: [], own_id="node-1", own_addr="127.0.0.1:50051", peer_client=peer_client)
    assert service._running is True
    service.stop()
    assert service._running is False
