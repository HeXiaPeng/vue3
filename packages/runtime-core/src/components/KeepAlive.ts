import { ShapeFlags } from '@vue/shared'
import { getCurrentInstance } from '../component'

export const isKeepAlive = type => type?.__isKeepAlive

export const KeepAlive = {
  name: 'KeepAlive',
  __isKeepAlive: true,
  setup(props, { slots }) {
    const instance = getCurrentInstance()

    const { options } = instance.ctx.renderer
    const { createElement, insert } = options
    /**
     * 缓存：
     * component => vnode
     * or
     * key => vnode
     */
    const cache = new Map()

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
      cache.set(key, vnode)

      /**
       * 先不让卸载
       */
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  },
}
