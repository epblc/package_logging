# epblc_logging

Logging package for frontend and backend JS/Node apps. Logs to console locally, sends to [Axiom](https://axiom.co) in deployed environments. Throttled batching, automatic caller info extraction, and request metadata helpers included.

## Install

```bash
npm install epblc_logging
```

## Quick start

```javascript
import { logger, backendlogger } from 'epblc_logging'

logger.info('page loaded')
logger.warn('slow query', { duration: 1200 })
logger.error('payment failed', { orderId: 'abc-123' })
```

- `logger` -- `FrontEndLogger`. Sends batched logs to `/log` via `sendBeacon` (falls back to `fetch`). Use in browser code.
- `backendlogger` -- `BackEndLogger`. Sends batched logs directly to the Axiom ingest API. Use in Node/server code.

Both throttle sends to 1 per second.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `logger` | `FrontEndLogger` | Pre-configured browser logger |
| `backendlogger` | `BackEndLogger` | Pre-configured server logger |
| `getInfoApi(request)` | function | Extract request metadata (IP hash, user-agent, path, query) for API logging |
| `getInfoFrontend({ session })` | function | Extract user/page info for frontend event logging |

### getInfoApi

Extracts IP (hashed daily with SHA-256), user-agent, path, query, and other headers from an API request object. Useful for structured API access logs:

```javascript
logger.info('api - users', { info: getInfoApi(req), statusCode: 200 })
```

### getInfoFrontend

Extracts user email from session and current page URL:

```javascript
logger.info('button clicked', { info: getInfoFrontend({ session }) })
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AXIOM_TOKEN` | Yes (server) | Axiom API bearer token |
| `AXIOM_DATASET` | Yes (server) | Axiom dataset name |
| `AXIOM_URL` | No | Axiom API base URL (default: `https://api.eu.axiom.co`) |
| `NEXT_PUBLIC_ENV` | Yes | `local` for console output, anything else for server output |
| `LOG_LEVEL` | No | Minimum log level: `info` (default), `warn`, or `error` |
| `SERVERID` | No | Server identifier attached to log events |
| `CUSTOMER_NAME` | No | Customer name for API info metadata |
| `URL` | No | Host URL for API info metadata |

## How it works

1. Each log call (`info`/`warn`/`error`) pushes a structured event to an internal buffer
2. A throttled flush sends the buffer contents at most once per second
3. Frontend logger posts to `/log` (expects a server-side proxy to forward to Axiom)
4. Backend logger posts directly to Axiom's `/v1/ingest/{dataset}` endpoint
5. When `NEXT_PUBLIC_ENV=local`, logs go to console only (with colored prefixes)

## Publishing

```bash
npm login
npm publish
```

Version is in `package.json`. Bump it before publishing:

```bash
npm version patch   # 1.0.23 -> 1.0.24
npm version minor   # 1.0.23 -> 1.1.0
npm version major   # 1.0.23 -> 2.0.0
```

## License

MIT -- see [LICENSE](LICENSE).
