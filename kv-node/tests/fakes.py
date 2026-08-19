from app.interfaces import PeerClient


class FakePeerClient(PeerClient):

    def __init__(self):
        self.replications = []
        self.hashes = {}
        self.ranges = {}
        self.get_responses = {}

    def replicate(
        self,
        peer_addr,
        key,
        value,
        modified_at,
        timeout=2
    ):
        self.replications.append(
            (
                peer_addr,
                key,
                value,
                modified_at
            )
        )
        return True

    def get(
        self,
        peer_addr,
        key,
        timeout=2
    ):
        return self.get_responses.get((peer_addr, key), None)

    def get_chunk_hash(
        self,
        peer_addr,
        chunk_id,
        timeout=5
    ):
        val = self.hashes.get((peer_addr, chunk_id))
        if isinstance(val, Exception):
            raise val
        return val

    def fetch_range(
        self,
        peer_addr,
        chunk_id,
        timeout=10
    ):
        val = self.ranges.get((peer_addr, chunk_id), [])
        if isinstance(val, Exception):
            raise val
        return val
