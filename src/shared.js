import crypto from 'crypto'

export const isBrowser = typeof window !== 'undefined'

export const throttle = (fn, wait) => {
  let lastFn, lastTime
  return function throttleFunction() {
    const context = this,
      args = arguments

    // First call, set lastTime
    if (lastTime == null) {
      lastTime = Date.now()
    }

    clearTimeout(lastFn)
    lastFn = setTimeout(() => {
      if (Date.now() - lastTime >= wait) {
        fn.apply(context, args)
        lastTime = Date.now()
      }
    }, Math.max(wait - (Date.now() - lastTime), 0))
  }
}

// used for keeping track of api interactions. Use it like this: logger.info('api - test', { info: getInfoApi(req), statusCode: 200 }).
export function getInfoApi(request) {
  const ip =
    request.headers['cf-connecting-ip'] ||
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.headers['x-client-ip']

  const customer_name = process.env.CUSTOMER_NAME
  const host = process.env.URL

  // Function to hash the IP address deterministically based on the date
  const hashIpAddress = (ip) => {
    const date = new Date()
    // Get the current date in the format YYYYMMDD, this allows hashed IPs to be the same during 24hours.
    const dateToday = date.toISOString().split('T')[0].replace(/-/g, '')
    const dataToHash = `${ip}-${dateToday}`
    const hash = crypto.createHash('sha256')
    return hash.update(dataToHash).digest('hex')
  }

  const message = {
    customer_name: customer_name,
    host: host,
    href: request.headers['x-invoke-path'],
    query: request.query,
    body: request.body,
    ip: ip ? hashIpAddress(ip) : null,
    'user-agent': request.headers['user-agent'],
    referer: request.headers['referer'],
    accept: request.headers['accept'],
    'accept-encoding': request.headers['accept-encoding'],
    'accept-language': request.headers['accept-language'],
  }
  return message
}

// used for keeping track of user interactions with the map. Use it f.i. like this: logger.info('Dataset Clicked', { action: `Dataset Clicked - ${state}`, mapId, datasetName, type: 'dataset', info: getInfoFrontend({}) })
export function getInfoFrontend({ session }) {
  const message = {
    user: session?.user.email || null,
    path: window.location.href,
    host: window.location.hostname,
  }
  return message
}
