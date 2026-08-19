import pytest
from app.storage import SQLiteStorage
from app.memory_storage import InMemoryStorage


@pytest.mark.parametrize(
    "storage_type",
    [
        "sqlite",
        "memory"
    ]
)
def test_storage_contract(
    storage_type,
    tmp_path
):
    if storage_type == "sqlite":
        storage = SQLiteStorage(
            str(tmp_path / "test.db")
        )
    else:
        storage = InMemoryStorage()

    assert storage.put(
        "name",
        "anas",
        100
    )

    assert storage.get(
        "name"
    ) == (
        "anas",
        100
    )


@pytest.mark.parametrize("storage_type", ["sqlite", "memory"])
def test_storage_stale_write_contract(storage_type, tmp_path):
    if storage_type == "sqlite":
        storage = SQLiteStorage(str(tmp_path / "stale.db"))
    else:
        storage = InMemoryStorage()

    storage.put("k", "v1", 200)
    assert storage.put("k", "v0", 100) is False
    assert storage.get("k") == ("v1", 200)


@pytest.mark.parametrize("storage_type", ["sqlite", "memory"])
def test_storage_chunk_scan_contract(storage_type, tmp_path):
    if storage_type == "sqlite":
        storage = SQLiteStorage(str(tmp_path / "scan.db"))
    else:
        storage = InMemoryStorage()

    storage.put("item1", "val1", 50)
    storage.put("item2", "val2", 60)

    found = []
    for c in range(16):
        found.extend(list(storage.scan_chunk_with_ts(c, 16)))

    assert len(found) == 2
    keys = {item[0] for item in found}
    assert keys == {"item1", "item2"}
