import os

from rocksdict import ColumnFamily, Options, Rdict, WriteBatch

from .constants import KNOWN_SOURCES

_DBS: dict[str, Rdict] = {}
_CFS: dict[str, dict[str, Rdict]] = {}
_CF_HANDLES: dict[str, dict[str, ColumnFamily]] = {}


def db_path() -> str:
    url = os.getenv("DATABASE_URL", "rocksdb://./data/gametree.rocksdb")
    prefix = "rocksdb://"
    if not url.startswith(prefix):
        raise RuntimeError("Only rocksdb DATABASE_URL is supported in this service.")
    return url.removeprefix(prefix)


def _raw_options() -> Options:
    return Options(raw_mode=True)


def db() -> Rdict:
    path = db_path()
    directory = os.path.dirname(path.rstrip("/"))
    if directory:
        os.makedirs(directory, exist_ok=True)

    if path in _DBS:
        return _DBS[path]

    root = Rdict(path, options=_raw_options())
    existing_cfs = set(Rdict.list_cf(path))
    for source in KNOWN_SOURCES:
        if source not in existing_cfs:
            root.create_column_family(source, _raw_options())

    _DBS[path] = root
    _CFS[path] = {source: root.get_column_family(source) for source in KNOWN_SOURCES}
    _CF_HANDLES[path] = {source: root.get_column_family_handle(source) for source in KNOWN_SOURCES}
    return root


def source_store(source: str) -> Rdict:
    path = db_path()
    if path not in _DBS:
        db()
    return _CFS[path][source]


def source_cf_handle(source: str) -> ColumnFamily:
    path = db_path()
    if path not in _DBS:
        db()
    return _CF_HANDLES[path][source]


def all_source_stores() -> dict[str, Rdict]:
    path = db_path()
    if path not in _DBS:
        db()
    return _CFS[path]


def new_write_batch() -> WriteBatch:
    return WriteBatch(raw_mode=True)


def write_batch(batch: WriteBatch) -> None:
    db().write(batch)


def monitor_store(cf: str) -> Rdict:
    if cf == "default":
        return db()
    if cf in KNOWN_SOURCES:
        return source_store(cf)
    raise KeyError(cf)


def close_all_databases() -> None:
    for open_db in _DBS.values():
        open_db.close()
    _DBS.clear()
    _CFS.clear()
    _CF_HANDLES.clear()
