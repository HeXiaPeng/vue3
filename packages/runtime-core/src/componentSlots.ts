import { ShapeFlags } from '@vue/shared'

export function initSlots(instance) {
  const { slots, vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    const { children } = vnode

    /**
     * 将最新的进行更新
     * children = { header: () => h('div', 'hello world') }
     * slots = { header: () => h('div', 'hello world'. ), footer: () => h('div', 'hello world'. )}
     */
    for (const key in children) {
      slots[key] = children[key]
    }

    /**
     * 把没有的删除
     * children = { header: () => h('div', 'hello world'. ), footer: () => h('div', 'hello world'. )}
     * slots = { header: () => h('div', 'hello world') }
     */
    for (const key in slots) {
      if (children[key] == null) {
        delete slots[key]
      }
    }
  }
}
