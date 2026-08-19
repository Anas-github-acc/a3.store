from unittest.mock import MagicMock, patch
from app.memory_storage import InMemoryStorage
from app.grpc_server import (
    KeyValueServicer,
    pick_replicas_for_key,
    sorted_peers,
    log_write,
    log_read,
    log_replicate_send,
    log_replicate_recv,
    replicate_to_peer,
)
from app import kv_pb2


def test_logging_helpers():
    with patch("app.grpc_server.DEBUG_LOG", True):
        log_write("node1:50051", "k", "v", 100)
        log_read("node1:50051", "k", True, "v")
        log_read("node1:50051", "k", False)
        log_replicate_send("node1:50051", "node2:50051", "k")
        log_replicate_recv("node2:50051", "k", "v")


def test_pick_replicas():
    with patch("app.grpc_server.membership", {
        "n1": {"addr": "node1:50051"},
        "n2": {"addr": "node2:50051"},
        "n3": {"addr": "node3:50051"},
    }):
        assert len(sorted_peers()) == 3
        replicas = pick_replicas_for_key("mykey", 2)
        assert len(replicas) == 2

    with patch("app.grpc_server.membership", {}):
        assert pick_replicas_for_key("mykey", 2) == []


def test_grpc_servicer_put_and_get():
    storage = InMemoryStorage()
    servicer = KeyValueServicer(storage, own_addr="node1:50051", replication_factor=1)

    req = kv_pb2.PutRequest(key="user:1", value="Alice", modified_at=100)
    context = MagicMock()

    resp = servicer.Put(req, context)
    assert resp.ok is True

    get_req = kv_pb2.GetRequest(key="user:1")
    get_resp = servicer.Get(get_req, context)
    assert get_resp.found is True
    assert get_resp.value == "Alice"
    assert get_resp.modified_at == 100

    get_req_missing = kv_pb2.GetRequest(key="missing")
    get_resp_missing = servicer.Get(get_req_missing, context)
    assert get_resp_missing.found is False


def test_grpc_servicer_replicate():
    storage = InMemoryStorage()
    servicer = KeyValueServicer(storage, own_addr="node2:50051", replication_factor=1)

    req = kv_pb2.PutRequest(key="user:2", value="Bob", modified_at=200)
    context = MagicMock()

    resp = servicer.Replicate(req, context)
    assert resp.ok is True

    val, ts = storage.get("user:2")
    assert val == "Bob"
    assert ts == 200


def test_grpc_servicer_chunk_hash_and_fetch_range():
    storage = InMemoryStorage()
    storage.put("key1", "val1", 50)
    servicer = KeyValueServicer(storage, own_addr="node1:50051", replication_factor=1)

    context = MagicMock()
    req_hash = kv_pb2.ChunkRequest(chunk_id=0)
    resp_hash = servicer.GetChunkHash(req_hash, context)
    assert hasattr(resp_hash, "hash")

    req_range = kv_pb2.RangeRequest(chunk_id=0)
    items = list(servicer.FetchRange(req_range, context))
    assert isinstance(items, list)


@patch("app.grpc_server.grpc.insecure_channel")
def test_grpc_server_replicate_to_peer_helper(mock_channel):
    mock_stub = MagicMock()
    with patch("app.grpc_server.kv_pb2_grpc.KeyValueStub", return_value=mock_stub):
        replicate_to_peer("node2:50051", "k", "v", 100, "node1:50051")
        assert mock_stub.Replicate.called

    mock_stub.Replicate.side_effect = Exception("gRPC error")
    with patch("app.grpc_server.kv_pb2_grpc.KeyValueStub", return_value=mock_stub):
        replicate_to_peer("node2:50051", "k", "v", 100, "node1:50051")


def test_grpc_servicer_put_replication():
    storage = InMemoryStorage()
    with patch("app.grpc_server.membership", {
        "n1": {"addr": "node1:50051"},
        "n2": {"addr": "node2:50051"},
    }):
        with patch("app.grpc_server.threading.Thread") as mock_thread:
            servicer = KeyValueServicer(storage, own_addr="node1:50051", replication_factor=2)
            req = kv_pb2.PutRequest(key="user:1", value="Alice", modified_at=100)
            context = MagicMock()
            servicer.Put(req, context)
            assert mock_thread.called
