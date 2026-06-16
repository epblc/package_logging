# CLAUDE.md

## Project

`epblc_logging` -- npm package providing structured logging for frontend and backend JS apps. Sends logs to Axiom in non-local environments, console in local.

## Structure

```
index.js          -- re-exports everything from src/
src/logger.js     -- Logger base class, FrontEndLogger, BackEndLogger
src/shared.js     -- throttle, isBrowser, getInfoApi, getInfoFrontend
```

Two files. That's the whole package.

## Key behavior

- `NEXT_PUBLIC_ENV=local` routes to console; anything else routes to Axiom
- Log events are buffered and flushed via throttle (1s interval)
- FrontEndLogger sends to `/log` proxy path via sendBeacon
- BackEndLogger sends directly to Axiom ingest API
- Stack trace parsing extracts caller file:line (skipped in Safari)
- `getInfoApi` hashes IPs daily with SHA-256 for privacy

## Commands

```bash
npm install       # install deps
npm test          # no tests exist yet
```

## No tests

There are no tests. If adding any, use a standard runner (vitest, jest) and add the script to package.json.
