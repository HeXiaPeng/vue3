import { ShapeFlags } from '@vue/shared'
import { getCurrentInstance } from '../component'

export const isKeepAlive = type => type?.__isKeepAlive

export const KeepAlive = {
  name: 'KeepAlive',
  __isKeepAlive: true,
  props: ['max'],
  setup(props, { slots }) {
    const instance = getCurrentInstance()

    const { options, unmount } = instance.ctx.renderer
    const { createElement, insert } = options
    /**
     * 缓存：
     * component => vnode
     * or
     * key => vnode
     */

    const cache = new LRUCahe(props.max)
    /**
     * 保存停用 dom 元素
     */
    const storageContainer = createElement('div')

    /**
     * 激活的时候，renderer.ts会调用这个方法，在 KeepAlive中，需要将之前缓存的 DOM 元素，移动到 container 中
     * @param vnode
     */
    instance.ctx.activate = (vnode, container, anchor) => {
      insert(vnode.el, container, anchor)
    }

    /**
     * unmount 不帮助卸载，需要自己手动操作
     * @param vnode
     */
    instance.ctx.deactivate = vnode => {
      insert(vnode.el, storageContainer)
    }

    return () => {
      const vnode = slots.default()

      const key = vnode.key != null ? vnode.key : vnode.type

      const cacheVNode = cache.get(key)
      if (cacheVNode) {
        /**
         * 复用缓存过的组件实例
         * 复用缓存过的 dom 元素
         */
        vnode.component = cacheVNode.component
        vnode.el = cacheVNode.el
        /**
         * 再打个标记，告诉 renderer.ts 复用之前的内容
         */
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
      }

      /**
       * 这一块，就是处理缓存
       */
      const _vnode = cache.set(key, vnode)
      if (_vnode) {
        /**
         * 卸载逻辑
         */
        resetShapeFlag(_vnode)
        unmount(_vnode)
      }

      /**
       * 先不让卸载
       */
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  },
}

function resetShapeFlag(vnode) {
  /**
   * 删除标记
   */
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_KEPT_ALIVE
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
}
class LRUCahe {
  cache = new Map()
  max
  constructor(max = Infinity) {
    this.max = max
  }

  get(key) {
    if (!this.cache.has(key)) return
    /**
     * 移动位置，放到最后
     */
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    let vnode
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else {
      if (this.cache.size >= this.max) {
        /**
         * 之前没有的，把最久没有使用过的，给丢掉
         */
        const firstKey = this.cache.keys().next().value
        vnode = this.cache.get(firstKey)
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
    return vnode
  }
}
