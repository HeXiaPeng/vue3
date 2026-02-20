/**
 * 链表节点
 */
export interface Link {
  // 保存 effect
  sub: Function
  // 下一个节点
  nextSub: Link | undefined
  //上一个极点
  prevSub: Link | undefined
}

/**
 * 链接链表关系
 * @param dep
 * @param sub
 */
export function link(dep, sub) {
  const newLink = {
    sub: sub,
    nextSub: undefined,
    prevSub: undefined,
  }

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

  queueEffect.forEach(effect => effect())
}
