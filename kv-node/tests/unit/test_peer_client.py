from unittest.mock import patch, MagicMock
from app.grpc_client import (
    GrpcPeerClient,
    get_stub,
    put_to_peer,
    replicate_to_peer,
    get_from_peer,
    get_chunk_hash,
    fetch_range
)
from tests.fakes import FakePeerClient


def test_fake_peer_client():
    fake = FakePeerClient()
    fake.hashes[("127.0.0.1:50052", 1)] = b"hash123"
    fake.ranges[("127.0.0.1:50052", 1)] = [("k1", "v1", 100)]
    fake.get_responses[("127.0.0.1:50052", "k1")] = ("v1", 100)

    assert fake.replicate("127.0.0.1:50052", "k1", "v1", 100) is True
    assert fake.replications == [("127.0.0.1:50052", "k1", "v1", 100)]
    assert fake.get("127.0.0.1:50052", "k1") == ("v1", 100)
    assert fake.get_chunk_hash("127.0.0.1:50052", 1) == b"hash123"
    assert fake.fetch_range("127.0.0.1:50052", 1) == [("k1", "v1", 100)]


@patch("app.grpc_client.replicate_to_peer")
@patch("app.grpc_client.get_from_peer")
@patch("app.grpc_client.get_chunk_hash")
@patch("app.grpc_client.fetch_range")
def test_grpc_peer_client_delegation(mock_fetch, mock_hash, mock_get, mock_replicate):
    client = GrpcPeerClient()

    mock_replicate.return_value = True
    mock_get.return_value = ("val", 10)
    mock_hash.return_value = b"chash"
    mock_fetch.return_value = [("k", "v", 10)]

    assert client.replicate("127.0.0.1:50051", "k", "v", 10) is True
    mock_replicate.assert_called_once_with("127.0.0.1:50051", "k", "v", 10, 2)

    assert client.get("127.0.0.1:50051", "k") == ("val", 10)
    mock_get.assert_called_once_with("127.0.0.1:50051", "k", 2)

    assert client.get_chunk_hash("127.0.0.1:50051", 3) == b"chash"
    mock_hash.assert_called_once_with("127.0.0.1:50051", 3, 5)

    assert client.fetch_range("127.0.0.1:50051", 3) == [("k", "v", 10)]
    mock_fetch.assert_called_once_with("127.0.0.1:50051", 3, 10)


@patch("app.grpc_client.kv_pb2_grpc.KeyValueStub")
@patch("grpc.insecure_channel")
def test_grpc_client_standalone_functions(mock_channel, mock_stub_class):
    mock_stub = MagicMock()
    mock_stub_class.return_value = mock_stub

    get_stub("127.0.0.1:50051")
    mock_channel.assert_called_with("127.0.0.1:50051")

    put_to_peer("127.0.0.1:50051", "k1", "v1", 100)
    assert mock_stub.Put.called

    replicate_to_peer("127.0.0.1:50051", "k1", "v1", 100)
    assert mock_stub.Replicate.called

    get_from_peer("127.0.0.1:50051", "k1")
    assert mock_stub.Get.called

    get_chunk_hash("127.0.0.1:50051", 2)
    assert mock_stub.GetChunkHash.called

    fetch_range("127.0.0.1:50051", 2)
    assert mock_stub.FetchRange.called
