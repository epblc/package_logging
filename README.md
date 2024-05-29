

# Logger Module

This module provides a flexible logging mechanism for both frontend and backend environments. It allows logging messages with different log levels (`info`, `warn`, `error`) and sends logs to the console and/or server based on the environment settings.

## Installation

To install the Logger module, you can use npm or yarn:

```bash
npm install epblc_logging
# or
yarn add epblc_logging
```

## Usage

```javascript
import { logger, backendlogger } from 'epblc_logging';

// Log an info message
logger.info('This is an info message');

// Log a warning message with additional properties
logger.warn('This is a warning message', { additionalInfo: 'some info' });

// Log an error message
logger.error('This is an error message');

// Use backendlogger to send logs to the server
backendlogger.info('Sending info log to the server');
```

## Configuration

The Logger module supports the following configuration options:

- **LOG_LEVEL**: Default log level (`info`, `warn`, `error`).
- **NEXT_PUBLIC_ENV**: Environment variable indicating the environment (e.g., `local`, `production` etc.).
- **LOG_TO_CONSOLE**: If 'local' output is sent to the console.
- **LOG_TO_SERVER**: If not 'local' output is sent to the server endpoint.
- **AXIOM_URL**: URL of the server to which logs will be sent.
- **AXIOM_TOKEN**: Token for authorization when sending logs to the server.
- **AXIOM_DATASET**: Dataset identifier for categorizing logs on the server.

## Classes

### Logger

The `Logger` class provides basic logging functionality with different log levels.

### FrontEndLogger

The `FrontEndLogger` class extends `Logger` and provides additional functionality for sending logs from the frontend to the server.

### BackEndLogger

The `BackEndLogger` class extends `Logger` and provides additional functionality for sending logs from the backend to the server.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

