import { isArray, isObject, ShapeFlags } from '@vue/shared'
import { createVNode } from './vnode'
/**
 * h 函数的使用方法
 * 1. h('div', 'hello world') 第二个参数为子节点
 * 2. h('div', [h('span', 'hello'), h('span', 'world')]) 第二个参数为子节点
 * 3. h('div', h('span', 'hello')) 第二个参数为子节点
 * 4. h('div', {class: 'container'}) 第二个参数是 props
 * ------------
 * 5. h('div', {class: 'container'}, 'hello world')
 * 6. h('div', {class: 'container'}, h('span', 'hello'))
 * 7. h('div', {class: 'container'}, h('span', 'hello'), h('span', 'hello'))
 * 8. h('div', {class: 'container'}, [h('span', 'hello'), h('span', 'hello')])
 */
export function h(type, propsOrChildren?, children?) {
  /**
   * h 函数，煮药的作用是对 createVNode 做一个参数的标准化（归一化）
   */
  let l = arguments.length

  if (l === 2) {
    if (Array.isArray(propsOrChildren)) {
      // h('div', [h('span', 'hello'), h('span', 'world')])
      return createVNode(type, null, propsOrChildren)
    }

    if (isObject(propsOrChildren)) {
      // h('div', [h('span', 'hello'), h('span', 'world')])
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // h('div', {class: 'container'})
      return createVNode(type, propsOrChildren, children)
    }

    // h('div', 'hello world')
    return createVNode(type, null, propsOrChildren)
  } else {
    if (l > 3) {
      /**
       * h('div', {class: 'container'}, h('span', 'hello'), h('span', 'hello'))
       * 转换成
       * h('div', {class: 'container'}, [h('span', 'hello'), h('span', 'hello')])
       */
      const children = [...arguments].slice(2)
    } else if (isVNode(children)) {
      // h('div', {class: 'container'}, h('span', 'hello'))
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}

/**
 * 判断是否为虚拟节点
 * @param value
 * @returns boolean
 */
function isVNode(value) {
  return value?.__v_isVNode
}
