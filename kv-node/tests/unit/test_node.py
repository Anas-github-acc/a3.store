from unittest.mock import patch
from app.node import start_gossip_http_server


def test_start_gossip_http_server():
    with patch("threading.Thread") as mock_thread:
        start_gossip_http_server()
        assert mock_thread.called
