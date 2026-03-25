import { Link, link, propagate } from './system'
import { activeSub } from './effect'

class Dep {
  /**
   * 订阅者头节点，理解为我 head
   */
  subs: Link

  /**
   * 订阅者链表的尾节点，理解为 tail
   */
  subsTail: Link
  constructor() {}
}

/**
 * 绑定 target 的 key 关联所有的 Dep
 * obj = { a: 0 }
 * targetMap = {
 *  [obj]: {
 *    a: Dep,
 *    b: Dep
 *  }
 * }
 */
const targetMap = new WeakMap()

export function track(target, key) {
  if (!activeSub) {
    return
  }

  /**
   * 找 depsMap = {
   *
   * }
   */
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    /**
     * 没有 depsMap，就是之前没有收集过这个对象的任何 key
     * 那就创建一个新的，保存 target 和 depsMap 之间的关联关系
     */
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    /**
     * 第一次收集这个对象，没找到，创建一个新的，并且保存到 depsMap中
     */
    dep = new Dep()

    depsMap.set(key, dep)
  }

  /**
   * 绑定 dep 和 sub 之间的关联关系
   */
  link(dep, activeSub)
}

export function trigger(target, key) {
  /**
   * 找 depsMap = {
   *    a: Dep,
   *    b: Dep
   * }
   */
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    /**
     * depsMap 没有，表示这个对象从来没有在 sub 中访问过
     */
    return
  }

  const targetIsArray = Array.isArray(target)
  if (targetIsArray && key === 'length') {
    /**
     * 更新数据的length
     * 更新前： length: 4 => ['a', 'b', 'c', 'd']
     * 更新后： length: 2 => ['a', 'b']
     * 得出结论：要通知访问了 c 和 d 的 effect 重新执行，就是访问了大于等于 length 的索引
     * depsMap = {
     *  0: Dep,
     *  1: Dep,
     *  2: Dep,
     *  length: Dep
     * }
     */
    depsMap.forEach((dep, depKey) => {
      if (depKey >= length || depKey === 'length') {
        // 通知访问了大于等于 length 的 effect 重新执行
        // 以及访问了 length 的 effect 重新执行
        propagate(dep.subs)
      }
    })
  } else {
    // 不是数组，或者数组更新的不是length
    const dep = depsMap.get(key)
    if (!dep) {
      // dep 不存在，表示这个 key 没有在 sub 中访问过
      return
    }

    /**
     * 找到 dep 的 subs 通知它们重新执行
     */
    propagate(dep.subs)
  }
}
