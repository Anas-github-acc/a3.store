import pytest
from app.memory_storage import InMemoryStorage
from tests.fakes import FakePeerClient


@pytest.mark.integration
def test_replication_across_nodes():
    node1_storage = InMemoryStorage()
    node2_storage = InMemoryStorage()

    peer_client = FakePeerClient()

    # Write key to node 1
    node1_storage.put("user:42", "Alice", 100)

    # Replicate to node 2
    peer_client.replicate("127.0.0.1:50052", "user:42", "Alice", 100)
    node2_storage.put("user:42", "Alice", 100)

    # Assert node 2 has the replicated value
    val1, ts1 = node1_storage.get("user:42")
    val2, ts2 = node2_storage.get("user:42")

    assert val1 == val2 == "Alice"
    assert ts1 == ts2 == 100
    assert len(peer_client.replications) == 1
