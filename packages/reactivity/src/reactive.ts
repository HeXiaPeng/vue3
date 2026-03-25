import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'
export function reactive(target) {
  return createReactiveObject(target)
}

/**
 * 保存 target 和 响应式对象之间的关联关系
 * target => proxy
 */
const reactiveMap = new WeakMap()

/**
 * 保存所有使用 reactive 创建出来的响应式对象
 */
const reactiveSet = new WeakSet()

function createReactiveObject(target) {
  /**
   * reactive 必须接受一个对象
   */
  if (!isObject(target)) {
    /**
     * target 不是一个对象
     */
    return target
  }

  /**
   * 获取之前的这个target创建的代理对象
   */
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  /**
   * 看一下 target 在不在 reactiveSet 里面，如果在，直接返回
   */
  if (reactiveSet.has(target)) {
    return target
  }

  /**
   * 创建 target 的代理对象
   */
  const proxy = new Proxy(target, mutableHandlers)

  // 保存 target 和 proxy 之间的关联关系
  reactiveMap.set(target, proxy)
  reactiveSet.add(proxy)
  return proxy
}

/**
 *
 * @param target 判断是不是响应式对象，只要在reactiveSet中，它就是响应式的
 * @returns
 */
export function isReactive(target) {
  return reactiveSet.has(target)
}
