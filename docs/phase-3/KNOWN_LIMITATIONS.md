# Phase 3 known limitations

## Current release blockers

1. The current Windows host cannot obtain an upstream HTTPS application response from `https://api.madrasti.xn--mgbaab0cxheq.tech`, even though DNS resolution and TCP port `443` succeed.
2. Because of that host-level connectivity blocker, valid Central login, valid School login, authenticated dashboards, and authenticated workflows cannot be marked PASS from this execution environment.
3. Manual browser-based responsive QA and accessibility QA are still pending because authenticated runtime flows are blocked upstream.
4. Docker CLI is installed, but Docker Desktop's Linux engine pipe is unavailable on this host, so container build/run verification is blocked externally.

## Non-blocking notes

- The focused Node test suite emits a non-fatal `MODULE_TYPELESS_PACKAGE_JSON` warning for retained in-repo ESM helper files. The tests still pass.
- `npm ci` reports transitive dependency advisories. No package upgrades were applied during this repair pass.