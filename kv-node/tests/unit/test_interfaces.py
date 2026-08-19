import pytest
from app.interfaces import StorageBackend, PeerClient


def test_storage_backend_interface_abstract():
    with pytest.raises(TypeError):
        StorageBackend()


def test_peer_client_interface_abstract():
    with pytest.raises(TypeError):
        PeerClient()
