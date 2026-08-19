import os
import sys
import pytest

# Ensure app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../app")))

from app.storage import SQLiteStorage
from app.memory_storage import InMemoryStorage


@pytest.fixture
def tmp_sqlite_storage(tmp_path):
    db_file = tmp_path / "test_node.db"
    return SQLiteStorage(str(db_file))


@pytest.fixture
def in_memory_storage():
    return InMemoryStorage()
