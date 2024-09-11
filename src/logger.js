import { throttle, isBrowser } from './shared.js'

const LOG_LEVEL = process.env.LOG_LEVEL || 'info' // 'info', 'warn', 'error'

const NO_OP = () => { }

export class Logger {
  constructor(options) {
    this.logEvents = [] // Initialize logEvents array in the constructor

    this.token = process.env.AXIOM_TOKEN
    this.dataset = process.env.AXIOM_DATASET
    this.environment = process.env.NEXT_PUBLIC_ENV
    this.axiomUrl = process.env.AXIOM_URL || 'https://api.eu.axiom.co'

    const LOG_TO_CONSOLE = this.environment === 'local' // if env is local, print to console
    const LOG_TO_SERVER = this.environment !== 'local' // if env is not local, print to server
    // default log level is set by env variable LOG_LEVEL
    const level = options?.level || LOG_LEVEL
    // format timestamp to YYYY-MM-DDTHH:MM:SS
    const timestamp = () => new Date().toISOString()

    this.error = (message, ...args) => {
      if (LOG_TO_CONSOLE) {
        console.error.bind(console, `%c[${timestamp()}] ERROR:`, 'color: red;', message, ...args)()
      }
      if (LOG_TO_SERVER) {
        let argsProps = {}
        if (args.length > 0) {
          for (const obj of args) {
            argsProps = { ...argsProps, ...obj } // Merge each object into argsProps
          }
        }
        // get orginal line and file name
        const error = new Error()
        const stack = error.stack.split('\n')[2].trim()
        const regex = /\((.*?)\)/;
        const matchResult = stack.match(regex);
        const called = matchResult ? matchResult[1] : null;
        // construct a json to send to the server
        const data = {
          level: 'error',
          message,
          timestamp: timestamp(),
          called,
          stack,
          source: isBrowser ?  'client' : 'server',
          serverid: process.env.SERVERID,
          props: argsProps,
        }
        this.logEvents.push(data)
        this.throttledSendLogs()
      }
    }

    if (level === 'error') {
      this.warn = NO_OP
      this.info = NO_OP

      return
    }

    this.warn = (message, ...args) => {
      if (LOG_TO_CONSOLE) {
        console.warn.bind(
          console,
          `%c[${timestamp()}] WARNING:`,
          'color: orange;',
          message,
          ...args
        )()
      }
      if (LOG_TO_SERVER) {
        let argsProps = {}
        if (args.length > 0) {
          for (const obj of args) {
            argsProps = { ...argsProps, ...obj } // Merge each object into argsProps
          }
        }
        // get orginal line and file name
        const error = new Error()
        const stack = error.stack.split('\n')[2].trim()
        const regex = /\((.*?)\)/;
        const matchResult = stack.match(regex);
        const called = matchResult ? matchResult[1] : null;
        const data = {
          level: 'warn',
          message,
          timestamp: timestamp(),
          called,
          stack,
          source: isBrowser ?  'client' : 'server',
          serverid: process.env.SERVERID,
          props: argsProps,
        }
        this.logEvents.push(data)
        this.throttledSendLogs()
      }
    }

    if (level === 'warn') {
      this.info = NO_OP
      return
    }

    this.info = (message, ...args) => {
      if (LOG_TO_CONSOLE) {
        console.log.bind(console, `%c[${timestamp()}] INFO:`, 'color: green;', message, ...args)()
      }
      if (LOG_TO_SERVER) {
        let argsProps = {}
        if (args.length > 0) {
          for (const obj of args) {
            argsProps = { ...argsProps, ...obj } // Merge each object into argsProps
          }
        }

        // get orginal line and file name
        const error = new Error()
        const stack = error.stack.split('\n')[2].trim()
        const regex = /\((.*?)\)/;
        const matchResult = stack.match(regex);
        const called = matchResult ? matchResult[1] : null;
        const data = {
          level: 'info',
          message,
          time: timestamp(),
          called,
          stack,
          source: isBrowser ?  'client' : 'server',
          serverid: process.env.SERVERID,
          props: argsProps,
        }
        this.logEvents.push(data)
        this.throttledSendLogs()
      }
    }
  }
}

export class FrontEndLogger extends Logger {
  constructor(options) {
    super(options)
    this.proxyPath = '/log'
    this.throttledSendLogs = throttle(this.sendData.bind(this), 1000)
    this.sendData = this.sendData.bind(this)
  }
  async sendData() {
    if (!this.logEvents.length) {
      return
    }
    const body = JSON.stringify(this.logEvents)
    this.logEvents = []

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.proxyPath, body)
    } else {
      // Fallback to other method if sendBeacon is not supported
      fetch(this.proxyPath, {
        method: 'POST',
        body,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      }).catch(console.error)
    }
  }
}

export class BackEndLogger extends Logger {
  constructor(options) {
    super(options)
    this.throttledSendLogs = throttle(this.sendData.bind(this), 1000)
    this.sendData = this.sendData.bind(this)
  }

  async sendData() {
    if (!this.logEvents.length) {
      return
    }
    const body = JSON.stringify(this.logEvents)
    this.logEvents = []
    try {
      await fetch(`${this.axiomUrl}/v1/datasets/${process.env.AXIOM_DATASET}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body,
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

export const logger = new FrontEndLogger({ level: LOG_LEVEL })
export const backendlogger = new BackEndLogger({ level: LOG_LEVEL })
