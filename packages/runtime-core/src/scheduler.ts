const resolvePromise = Promise.resolve()

export function nextTick(fn) {
  return resolvePromise.then(() => fn.call(this))
}

export function queueJob(job) {
  // 把渲染函数放到微任务里
  Promise.resolve().then(() => {
    job()
  })
}
