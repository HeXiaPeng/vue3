import {
  isArray,
  isFunction,
  isObject,
  isString,
  ShapeFlags,
} from '@vue/shared'
import { isNumber } from '@vue/shared'
import { getCurrentRenderingInstance } from './renderTemplateRef'
import { isTeleport } from './components/Teleport'

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

function normalizeChildren(vnode, children) {
  let { shapeFlag } = vnode

  //regin 处理 type 的 shapeFlag
  if (isArray(children)) {
    /**
     * children = [h('p', 'hello'), h('p', 'world')]
     */
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    /**
     * children = {header: () => h('div', 'hello world')}
     */
    if (shapeFlag & ShapeFlags.COMPONENT) {
      // 如果是组件，那么就是插槽
      shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  } else if (isFunction(children)) {
    /**
     * children = () => h('div', ')
     */
    shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    children = { default: children }
  }
  if (isNumber(children) || isString(children)) {
    // 如果 children 是 number，转换为string
    children = String(children)
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }

  /**
   * 处理完了重新赋值 shapeFlag 和 children
   */
  vnode.shapeFlag = shapeFlag
  vnode.children = children
  return children
}

function normalizeRef(ref) {
  if (ref == null) return
  return {
    // 原始的ref
    r: ref,
    // 当前正在渲染组件的实例
    i: getCurrentRenderingInstance(),
  }
}

/**
 * 创建虚拟节点底层方法
 * @param type 节点类型
 * @param props 节点属性
 * @param children 子节点v
 */
export function createVNode(type, props?, children = null) {
  let shapeFlag = 0

  //#region 处理 type 的 shapeFlag
  if (isString(type)) {
    // div span p h1
    shapeFlag = ShapeFlags.ELEMENT
  } else if (isTeleport(type)) {
    // Teleport
    shapeFlag = ShapeFlags.TELEPORT
  } else if (isObject(type)) {
    // 有状态的组件
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  } else if (isFunction(type)) {
    // 函数式组件
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
  }
  //#endregion

  const vnode = {
    // 证明是一个虚拟节点
    __v_isVNode: true,
    // div p span
    type,
    props,
    // hello world
    children: null,
    // 做 diff 用的
    key: props?.key,
    // 虚拟节点要挂载的地方
    el: null,
    // 如果为9，表示type 是一个 dom 元素，children 是一个字符串
    shapeFlag: shapeFlag,
    ref: normalizeRef(props?.ref),
    appContext: null,
  }

  /**
   * children 的标准化 shapeFlag
   */
  children = normalizeChildren(vnode, children)
  return vnode
}
