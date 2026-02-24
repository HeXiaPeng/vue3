import { ReactiveEffect } from 'vue'

/**
 * 依赖项，谁依赖了我
 */
interface Dep {
  // 订阅者链表的头节点
  subs: Link | undefined
  // 订阅者；链表的尾节点
  subsTail: Link | undefined
}

/**
 * 订阅者，我依赖谁
 */
export interface Sub {
  deps: Link | undefined
  depsTail: Link | undefined
  notify(): void
}

/**
 * 链表节点
 */
export interface Link {
  // 订阅者
  sub: Sub
  // 下一个订阅者节点
  nextSub: Link | undefined
  //上一个订阅者点
  prevSub: Link | undefined
  // 依赖项
  dep: Dep
  // 下一个依赖项节点
  nextDep: Link | undefined
}

/**
 * 链接链表关系
 * @param dep
 * @param sub
 */
export function link(dep, sub) {
  //region 尝试复用链表节点
  const currentDep = sub.depsTail
  /**
   * 分两种情况：
   * 1. 如果头节点有，尾节点没有，那么尝试着复用头节点
   * 2. 如果尾节点还有 nextDep，尝试复用尾节点的 nextDep
   */
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep
  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }
  //endregion
  const newLink = {
    sub: sub,
    dep: dep,
    nextDep,
    nextSub: undefined,
    prevSub: undefined,
  }

  //region 将链表节点和 dep 建立关联关系
  /**
   * 关联链表关系，分两种关系
   * 1. 尾节点有，直接往尾节点加
   * 2. 尾节点无，则表示第一次关联，直接将头尾节点指向新节点
   */
  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.prevSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }
  //endregin

  //region 将链表节点和 sub 建立关联关系
  /**
   * 关联链表关系，分两种关系
   * 1. 尾节点有，直接往尾节点加
   * 2. 尾节点无，则表示第一次关联，直接将头尾节点指向新节点
   */
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
    sub.depsTail = newLink
  } else {
    sub.deps = newLink
    sub.depsTail = newLink
  }
  //endregin
}

/**
 * 传播更新函数
 * @param subs
 */
export function propagate(subs) {
  // 通知 effect 重新执行，获取最新的值
  let link = subs
  let queueEffect = []
  while (link) {
    queueEffect.push(link.sub)
    link = link.nextSub
  }

  queueEffect.forEach(effect => effect.notify())
}

/**
 * 开始追踪依赖
 * @param sub
 */
export function startTrack(sub) {
  sub.depsTail = undefined
}

/**
 * 结束追踪
 * @param sub
 */
export function endTrack(sub) {
  /**
   * depsTail 有，并且还有 nextDep，我们应该把他们的依赖关系清理掉
   * depsTail 没有，并且头节点有，那就把所有内容都清理掉
   */
  const depsTail = sub.depsTail
  if (depsTail && depsTail.nextDep) {
    clearTracking(depsTail.nextDep)
    depsTail.nextDep = undefined
  } else if (!depsTail && sub.deps) {
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}

/**
 * 指针删除节点
 * @param link
 */
export function clearTracking(link: Link) {
  while (link) {
    const { sub, prevSub, nextSub, nextDep, dep } = link
    /**
     * 清楚上一个节点对删除节点的依赖
     * 如果没有上一个节点，当前为头节点，需要把 dep.subs 指向下一个节点
     */
    if (prevSub) {
      prevSub.nextSub = nextSub
      link.nextSub = undefined
    } else {
      dep.subs = nextSub
    }

    if (nextSub) {
      nextSub.prevSub = prevSub
      link.prevSub = undefined
    } else {
      dep.subsTail = prevSub
    }

    link.dep = link.sub = undefined

    link.nextDep = undefined

    link = nextDep
  }
}
