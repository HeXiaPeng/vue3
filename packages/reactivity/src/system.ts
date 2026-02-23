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
interface Sub {
  deps: Link | undefined
  depsTail: Link | undefined
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
  debugger
  if (nextDep && nextDep.dep === dep) {
    console.log('复用节点', nextDep)
    sub.depsTail = nextDep
    return
  }
  //endregion
  const newLink = {
    sub: sub,
    dep: dep,
    nextDep: undefined,
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
