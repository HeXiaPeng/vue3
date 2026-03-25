import { isFunction, isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isRef } from './ref'
import { isReactive } from './reactive'

export function watch(source, cb, options) {
  let { immediate, once, deep } = options || {}

  if (once) {
    // 如果 once 传了， 那我就保存一份，新的 cb 等于直接调用原来的，加上 stop 监听
    const _cb = cb
    cb = (...args) => {
      _cb(...args)
      stop()
    }
  }

  let getter

  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    // 如果是一个 reactive，将 deep 转为 true
    // 如果传了，传了的为主
    getter = () => source
    if (!deep) {
      deep = true
    }
  } else if (isFunction(source)) {
    getter = source
  }

  if (deep) {
    const baseGetter = getter
    const depth = deep === true ? Infinity : deep
    getter = () => traverse(baseGetter(), depth)
  }

  let oldValue

  let cleanup = null
  function onCleanup(cb) {
    cleanup = cb
  }

  function job() {
    // 清理上一次的副作用
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    // 执行 effect.run 拿到 getter 的返回值， 不能直接执行 getter，因为要依赖手机
    const newValue = effect.run()
    // 执行用户回调，
    cb(newValue, oldValue, onCleanup)
    // 下一次的 oldValue 是这一次的 newValue
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter)

  effect.scheduler = job

  if (immediate) {
    job()
  } else {
    // 拿到 oldValue，并且收集依赖
    oldValue = effect.run()
  }

  // 停止监听
  function stop() {
    effect.stop()
  }

  return stop
}

/**
 * 递归出触发 getter
 * @param value
 * @param depth
 * @param seen
 * @returns
 */
function traverse(value, depth = Infinity, seen = new Set()) {
  // 如果不是一个对象，或者监听层级到了，直接返回 value
  if (!isObject(value) || depth <= 0) {
    return value
  }

  // 如果直接访问过，那么直接返回，防止循环引用栈溢出
  if (seen.has(value)) {
    return value
  }

  depth--
  seen.add(value)

  for (const key in value) {
    // 递归触发 getter
    traverse(value[key], depth, seen)
  }

  return value
}
