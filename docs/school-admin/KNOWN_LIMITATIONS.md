# Known Limitations

## Blocking for final closure

1. A legitimate school account was not available in this CLI session, so authenticated school CRUD workflows were not executed end-to-end.
2. Full manual responsive QA in a browser across all required viewports remains pending staging execution.
3. Full manual accessibility walkthrough remains pending staging execution.
4. `npm ci` was not rerun in this session because the environment already had a working dependency tree and the focus stayed on source completion plus non-destructive verification.

## Not limitations

- TypeScript, lint, tests, and production build all passed after the implementation.
- Public login pages, session route, health routes, and unauthenticated school-route redirects were verified in local production runtime.