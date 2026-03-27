import { ShapeFlags } from '@vue/shared'
import { patchProp } from 'packages/runtime-dom/src/patchProps'

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function createRenderer(options) {
  // 提供虚拟节点 渲染到页面上的功能
  console.log(options)

  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    createText: hostCreateText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = options

  // 卸载子元素
  const unmountChildren = children => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  const unmount = vnode => {
    // 卸载

    const { type, shapeFlag, children } = vnode

    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点是数组
      unmountChildren(children)
    }
    hostRemove(vnode.el)
  }

  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      // 递归挂载子节点
      patch(null, child, el)
    }
  }

  const mountElement = (vnode, container) => {
    /**
     * 1. 设置一个 dom 节点
     * 2. 设置它的 props
     * 3. 挂载它的子节点
     */

    const { type, props, children, shapeFlag } = vnode
    // 创建 dom 元素 type = div p span
    const el = hostCreateElement(type)

    vnode.el = el
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 子节点是文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点是数组
      mountChildren(children, el)
    }

    // 将 el 挂载到 container 中
    hostInsert(el, container)
  }

  const patchProps = (el, oldProps, newProps) => {
    /**
     * 1. 把老的 props 全删除
     * 2. 把新的 props 全设置上
     */

    if (oldProps) {
      for (const key in oldProps) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
    if (newProps) {
      for (const key in oldProps) {
        hostPatchProp(el, key, oldProps?.[key], newProps[key])
      }
    }
  }

  const patchChildren = (n1, n2) => {
    const el = n2.el
    /**
     * 1. 新节点它的子节点是 文本
     *    1.1 老的也是文本
     *    1.2 老的是数组
     * 2. 新节点的子节点是数组 或者为 null
     *    2.1 老的也是数组
     *    2.2 老的也是文本
     *    2.3 老的可能是 null
     */

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组，把老的 children 卸载
        unmountChildren(n1.children)
      }

      if (n1.children !== n2.children) {
        // 设置问问，如果 n2 和 n2 的 children 不一样
        hostSetElementText(el, n2.children)
      }
    } else {
      // 老的有可能是数组，或者 null 或者文本
      // 新的有可能是数组，或者 null
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 删除老的节点
        hostSetElementText(el, '')

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 挂载新的节点
          mountChildren(n2.children, el)
        }
      } else {
        // 老的数组 或者 null
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新的是数组，老的也是数组，全量diff
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // TODO
          } else {
            // 新的不是数组，卸载老的数组
            unmountChildren(n1.children)
          }
        } else {
          // 老的是 null
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 新的是数组，卸载老的数组
            mountChildren(n2.children, el)
          }
        }
      }
    }
  }

  const patchElement = (n1, n2) => {
    /**
     * 1. 复用 dom 元素
     * 2. 更新 props
     * 3. 更新 children
     */
    // 复用 dom 元素，每次进来，都拿上一次的 el，保存到最新的虚拟节点 n2.el
    const el = (n2.el = n1.el)

    // 更新 props
    const oldProps = n1.props
    const newProps = n2.props
    patchProps(el, oldProps, newProps)

    // 更新 children
    patchChildren(n1, n2)

    console.log(el)
  }

  /**
   * 更新和挂载都用这个函数
   * @param n1 老节点，如果有，表示要跟 n2 做 diff 更新，如果没有直接挂载 n2
   * @param n2 新节点
   * @param container 要挂载的容器
   */
  const patch = (n1, n2, container) => {
    if (n1 === n2) return
    // debugger
    if (n1 && !isSameVNodeType(n1, n2)) {
      // 如果n1，n2不是同一个类型（标签类型改变，key改变），那就卸载
      unmount(n1)
      n1 = null
    }

    if (n1 == null) {
      mountElement(n2, container)
    } else {
      // 更新
      patchElement(n1, n2)
    }
  }

  const render = (vnode, container) => {
    /**
     * 分三步
     * 1. 挂载
     * 2. 更新
     * 3. 卸载
     */
    if (vnode == null) {
      if (container._vnode) {
        // 卸载
        unmount(container._vnode)
      }
    } else {
      // 挂载和更新
      patch(container._vnode || null, vnode, container)
    }

    // 把最新的 vnode 保存到 container 中，以便下一次 diff 或者卸载
    container._vnode = vnode
  }
  return {
    render,
  }
}
