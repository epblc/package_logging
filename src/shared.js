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

export const isBrowser = typeof window !== 'undefined'
