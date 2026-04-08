import { isArray, isObject, isString, ShapeFlags } from '@vue/shared'
import { isNumber } from '@vue/shared'

/**
 * 文本节点标记
 */
export const Text = Symbol('v-txt')

export function normalizeVnode(vnode) {
  if (isString(vnode) || isNumber(vnode)) {
    return createVNode(Text, null, String(vnode))
  }
  return vnode
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

function normalizeChildren(children) {
  if (isNumber(children)) {
    // 如果 children 是 number，转换为string
    children = String(children)
  }
  return children
}

/**
 * 创建虚拟节点底层方法
 * @param type 节点类型
 * @param props 节点属性
 * @param children 子节点v
 */
export function createVNode(type, props?, children = null) {
  debugger
  children = normalizeChildren(children)
  let shapeFlag = 0

  if (isString(type)) {
    // div span p h1
    shapeFlag = ShapeFlags.ELEMENT
  } else if (isObject(type)) {
    // 有状态的组件
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  }

  if (isString(children)) {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  const vnode = {
    // 证明是一个虚拟节点
    __v_isVNode: true,
    // div p span
    type,
    props,
    // hello world
    children,
    // 做 diff 用的
    key: props?.key,
    // 虚拟节点要挂载的地方
    el: null,
    // 如果为9，表示type 是一个 dom 元素，children 是一个字符串
    shapeFlag: shapeFlag,
  }
  return vnode
}
