import pytest
import zlib
from app.memory_storage import InMemoryStorage
from app.anti_entropy import AntiEntropyService, compute_chunk_hash
from tests.fakes import FakePeerClient


class MockKV:
    def __init__(self, key, value, modified_at):
        self.key = key
        self.value = value
        self.modified_at = modified_at


@pytest.mark.integration
def test_cluster_anti_entropy_recovery():
    # Node 1 missing key "user:100"
    node1_storage = InMemoryStorage()

    # Node 2 has key "user:100"
    node2_storage = InMemoryStorage()
    node2_storage.put("user:100", "Bob", 300)

    peer_client = FakePeerClient()
    peer2_addr = "node2:50051"

    chunk_id = zlib.crc32("user:100".encode("utf-8")) % 16

    # Node 2 hashes
    for c in range(16):
        peer_client.hashes[(peer2_addr, c)] = compute_chunk_hash(node2_storage, c)

    # Node 2 range data
    peer_client.ranges[(peer2_addr, chunk_id)] = [
        MockKV("user:100", "Bob", 300)
    ]

    # Run Anti-Entropy on Node 1 with Node 2 as peer provider
    ae_service = AntiEntropyService(
        storage=node1_storage,
        peer_client=peer_client,
        peer_provider=lambda: [peer2_addr],
        own_id="node1",
        own_addr="node1:50051"
    )

    ae_service.run_sync_round()

    # Verify Node 1 was repaired and recovered key "user:100"
    val, ts = node1_storage.get("user:100")
    assert val == "Bob"
    assert ts == 300
