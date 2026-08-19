from fastapi.testclient import TestClient
from app.gossip import app, membership, ensure_self_in_membership


client = TestClient(app)


def test_gossip_endpoints():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    response = client.get("/membership")
    assert response.status_code == 200

    gossip_payload = {
        "node_id": "node-2",
        "addr": "127.0.0.1:50052",
        "heartbeat": 5
    }
    response = client.post("/gossip", json=gossip_payload)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    assert "node-2" in membership
    assert membership["node-2"]["hb"] == 5

    metrics_resp = client.get("/metrics")
    assert metrics_resp.status_code == 200


def test_ensure_self_in_membership():
    ensure_self_in_membership("node-1", "127.0.0.1:50051", 10)
    assert membership["node-1"]["hb"] == 10
