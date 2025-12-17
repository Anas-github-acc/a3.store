# Consistency
## The Consistency Protocol: Quorum Writes
sends the write to all RF nodes simultaneously instead of relying on gossips only

## Replace SQLite with RocksDB / BadgerDB

Add:
- vector clocks (instead of timestamps)
- hinted handoff
- anti-entropy via Merkle trees

<br>

# Synchronous Writes - Quorum Approach

#### 1. The Write Path (Put Request with Hinted Handoff)
Coordinator Routing: The client sends a PUT to any node (the Coordinator); it calculates the hash of the key to identify the 3 replica nodes (e.g., A, B, C) responsible for that data.

Parallel Writes & Hints: The Coordinator sends the write to A, B, and C simultaneously. If Node B is down, the Coordinator writes a "Hint" locally (a persistent note saying "Send this mutation to Node B when it comes back online").

Quorum Wait: The Coordinator waits until it receives W acknowledgments (e.g., if W=2, it needs success from A and C). The local Hint storage counts towards durability.

Client Ack: Once the Quorum (W) is met, the Coordinator returns "Success" to the client immediately, while the Hint waits passively to replay data to Node B later.

#### 2. The Read Path (Get Request as Coordinator)
Owner Identification: The client sends a GET to Node H (Coordinator). Node H checks the hash ring and realizes it does not own the data, but Nodes A, B, and C do.

Quorum Fetch: Node H acts as a proxy and requests the data from R nodes (e.g., if R=2, it asks A and B). It typically asks one for the full data and the other for a hash/checksum to save bandwidth.

Conflict Resolution (Read Repair): Node H compares the timestamps/versions of the responses. If Node A returns "Version 2" and Node B returns "Version 1", Node H picks Version 2.

Response: Node H returns the latest data (Version 2) to the client and (in the background) sends a write command to Node B to update it to Version 2 immediately.

[Gemini Link to knowledge](https://gemini.google.com/share/536404119a9f)