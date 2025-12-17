from fastapi import FastAPI
import requests

app = FastAPI()
store = {}        # in-memory KV store
neighbors = []    # replica nodes

@app.put("/key/{key}")
def put_value(key: str, value: str):
    store[key] = value
    for node in neighbors:
        requests.put(f"http://{node}/replica/{key}", params={"value": value})
    return {"status": "ok"}

@app.get("/key/{key}")
def get_value(key: str):
    return {"value": store.get(key, None)}

@app.put("/replica/{key}")
def replicate(key: str, value: str):
    store[key] = value
    return {"replicated": True}
