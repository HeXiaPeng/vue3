import { ShapeFlags } from '@vue/shared'
import {
  setCurrentRenderingInstance,
  unsetCurrentRenderingInstance,
} from './renderTemplateRef'

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  /**
   * prevProps = { msg: 'hello', count: 0}
   * nextProps = { msg: 'hello;}
   */

  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }

  for (const key of nextKeys) {
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }

  /**
   * 遍历完了全部一致
   */
  return false
}
export function shouldUpdateComponenet(n1, n2) {
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2

  /**
   * 任意一个有插槽，就需要更新
   */
  if (prevChildren || nextChildren) {
    return true
  }

  if (!prevProps) {
    // 老的没有，新的有，需要更新
    // 老的没有，新的也没有，不需要更新
    return !!nextProps
  }

  if (!nextProps) {
    // 老的有，新的没有，需要更新
    return true
  }

  /**
   * 老的有，新的也有
   */
  return hasPropsChanged(prevProps, nextProps)
}

export function renderComponentRoot(instance) {
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    setCurrentRenderingInstance(instance)
    const subTree = instance.render.call(instance)
    unsetCurrentRenderingInstance()
    return subTree
  } else {
    // 函数式组件

    return vnode.type(instance.props, {
      get attrs() {
        return instance.attrs
      },
      slots: instance.slots,
      emit: instance.emit,
    })
  }
}
