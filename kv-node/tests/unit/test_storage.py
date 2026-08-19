from app.storage import SQLiteStorage


def test_put_and_get(tmp_path):
    db = tmp_path / "node.db"
    storage = SQLiteStorage(str(db))

    assert storage.put(
        "user:1",
        "Anas",
        100
    )

    value, ts = storage.get(
        "user:1"
    )

    assert value == "Anas"
    assert ts == 100


def test_missing_key(tmp_path):
    db = tmp_path / "node.db"
    storage = SQLiteStorage(str(db))

    value, ts = storage.get(
        "missing"
    )

    assert value is None
    assert ts == 0


def test_rejects_stale_write(tmp_path):
    db = tmp_path / "node.db"
    storage = SQLiteStorage(str(db))

    storage.put(
        "user:1",
        "new-value",
        200
    )

    result = storage.put(
        "user:1",
        "old-value",
        100
    )

    assert result is False

    value, ts = storage.get(
        "user:1"
    )

    assert value == "new-value"
    assert ts == 200


def test_overwrite_with_equal_timestamp(tmp_path):
    db = tmp_path / "node.db"
    storage = SQLiteStorage(str(db))

    storage.put("key1", "val1", 100)
    result = storage.put("key1", "val2", 100)
    assert result is False

    val, ts = storage.get("key1")
    assert val == "val1"
    assert ts == 100


def test_scan_chunk_with_ts(tmp_path):
    db = tmp_path / "node.db"
    storage = SQLiteStorage(str(db))

    storage.put("k1", "v1", 10)
    storage.put("k2", "v2", 20)

    all_scanned = []
    for chunk_id in range(16):
        all_scanned.extend(list(storage.scan_chunk_with_ts(chunk_id, 16)))

    scanned_keys = {item[0] for item in all_scanned}
    assert scanned_keys == {"k1", "k2"}
