import { isFunction } from '@vue/shared'
import { proxyRefs } from '.'
import { initProps, normalizePropsOptions } from './componentProps'

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
    /**
     * 用户声明的组件 props
     */
    propsOption: normalizePropsOptions(type.props),
    props: {},
    attrs: {},
    // 子树，就是 render 的返回结果
    subTree: null,
    isMounted: false,
  }
  return instance
}

export function setupComponent(instance) {
  /**
   * 初始化属性
   */
  const { type } = instance
  initProps(instance)
  const setupContext = createSetupContext(instance)
  if (isFunction(type.setup)) {
    const setupResult = proxyRefs(type.setup(instance.props, setupContext))
    // 拿到setup返回的状态
    instance.setupState = setupResult
  }
  console.log('instance ==>', instance)

  // 将 render 状态绑定到 instance
  instance.render = type.render
}

/**
 * 创建 setupContext
 * @param instance
 * @returns
 */
function createSetupContext(instance) {
  return {
    get attrs() {
      return instance.attrs
    },
  }
}
