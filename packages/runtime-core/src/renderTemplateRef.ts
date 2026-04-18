import { isRef } from '@vue/reactivity'
import { isString, ShapeFlags } from '@vue/shared'
import { getComponentPublicInstance } from './component'

export function setRef(ref, vnode) {
  const { r: rawRef, i: instance } = ref

  if (vnode == null) {
    // 卸载要清空
    if (isRef(rawRef)) {
      rawRef.value = null
    } else if (isString(rawRef)) {
      instance.refs[rawRef] = null
    }

    return
  }

  const { shapeFlag } = vnode

  if (isRef(rawRef)) {
    if (shapeFlag & ShapeFlags.COMPONENT) {
      // vnode 是一个组件类型
      rawRef.value = getComponentPublicInstance(vnode.component)
    } else {
      // vnode DOM 是一个元素类型
      rawRef.value = vnode.el
    }
  } else if (isString(rawRef)) {
    // 把 vnode.el 绑定到 instance.$refs[ref]上面
    if (shapeFlag & ShapeFlags.COMPONENT) {
      // 组件
      instance.refs[rawRef] = getComponentPublicInstance(vnode.component)
    } else {
      // DOM元素
      instance.refs[rawRef] = vnode.el
    }
  }
}

let currentRenderingInstance = null

export function setCurrentRenderingInstance(instance) {
  currentRenderingInstance = instance
}

export function unsetCurrentRenderingInstance() {
  currentRenderingInstance = null
}

export function getCurrentRenderingInstance() {
  return currentRenderingInstance
}
