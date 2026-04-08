import { proxyRefs } from '.'

/**
 * 创建组件实例
 * @param vnode
 * @returns
 */
export function createComponentInstance(vnode) {
  const { type } = vnode
  const instance = {
    type,
    vnode,
    render: null,
    // setup 返回的状态
    setupState: null,
    props: {},
    attrs: {},
    // 子树，就是 render 的返回结果
    subTree: null,
    isMounted: false,
  }
  return instance
}

export function setupComponent(instance) {
  const { type } = instance

  const setupResult = proxyRefs(type.setup())
  // 拿到setup返回的状态
  instance.setupState = setupResult
  // 将 render 状态绑定到 instance
  instance.render = type.render
  return
}
