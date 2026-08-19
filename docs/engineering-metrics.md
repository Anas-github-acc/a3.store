# Engineering Metrics

This document tracks empirical engineering metrics, test coverage logs, and performance benchmark evidence for `a3.store`. Raw execution outputs and artifacts are saved under `docs/metrics/`.

## Test Coverage
- Date: 2026-08-19
- Tool: pytest-cov
- Overall coverage: 83%
- Statements: 569
- Missed statements: 99
- Scope: `kv-node/app/`
- Command:
  ```bash
  cd kv-node && pytest --cov=app --cov-report=term-missing > ../docs/metrics/coverage/2026-08-19.txt
  ```
- Evidence: `docs/metrics/coverage/2026-08-19.txt`
