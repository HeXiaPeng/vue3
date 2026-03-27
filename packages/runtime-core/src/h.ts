import { isArray, isObject } from '@vue/shared'
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

/**
 * 创建虚拟节点底层方法
 * @param type 节点类型
 * @param props 节点属性
 * @param children 子节点v
 */
function createVNode(type, props?, children?) {
  const vnode = {
    // 证明是一个虚拟节点
    __v_isVNode: true,
    type,
    props,
    children,
    // 做 diff 用的
    key: props?.key,
    // 虚拟节点要挂载的地方
    el: null,
    shapeFlag: 9,
  }
  return vnode
}
