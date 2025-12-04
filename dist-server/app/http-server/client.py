import requests
from app.ring import ConsistentHashRing

nodes = ["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:8002"]
ring = ConsistentHashRing(nodes)

REPLICATION_FACTOR = 2

def put(key, value):
    primary = ring.get_node(key)

    # find replica (next in ring)
    idx = nodes.index(primary)
    replicas = [nodes[(idx+i) % len(nodes)] for i in range(1, REPLICATION_FACTOR+1)]

    # send to primary
    requests.put(f"http://{primary}/key/{key}", params={"value": value})

    print(f"Key stored at: {primary} and replicas: {replicas}")

def get(key):
    primary = ring.get_node(key)
    try:
        r = requests.get(f"http://{primary}/key/{key}")
        return r.json()["value"]
    except:
        print("Primary down, checking replicas...")
