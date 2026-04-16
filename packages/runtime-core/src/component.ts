import { hasOwn, isFunction, isObject } from '@vue/shared'
import { proxyRefs } from '.'
import { initProps, normalizePropsOptions } from './componentProps'
import { nextTick } from './scheduler'
import { initSlots } from './componentSlots'

/**
 * 创建组件实例
 * @param vnode
 * @returns
 */
export function createComponentInstance(vnode) {
  const { type } = vnode
  const instance: any = {
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
    // 组件的插槽
    slots: {},
    refs: {},
    // 子树，就是 render 的返回结果
    subTree: null,
    isMounted: false,
  }
  instance.ctx = { _: instance }

  // instance.emit = (event, ...args) => emit(instance, event, ...args)
  instance.emit = emit.bind(null, instance)
  // instance.emit('foo', 1)
  // instance.$emit('foo', 1)
  return instance
}

export function setupComponent(instance) {
  /**
   * 初始化属性
   * 初始化插槽
   * 初始化状态
   */

  // 初始化属性
  initProps(instance)

  // 初始化插槽
  initSlots(instance)
  // 初始化状态
  setupStatefulComponent(instance)
}

const publicPropertiesMap = {
  $el: instance => instance.vnode.el,
  $attrs: instance => instance.attrs,
  $emit: instance => instance.emit,
  $slots: instance => instance.slots,
  $refs: instance => instance.refs,
  $nextTick: instance => {
    return nextTick.bind(instance)
  },
  $forceUpdate: instance => {
    return () => instance.update
  },
}

const publicInstanceProxyHandlers = {
  get(target, key) {
    const { _: instance } = target
    const { setupState, props } = instance

    /**
     * 访问某个属性，先去 setupState 中查找
     * 如果没有再去 props 中找
     */
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }

    if (hasOwn(props, key)) {
      return props[key]
    }

    if (hasOwn(publicPropertiesMap, key)) {
      const publicGetter = publicPropertiesMap[key]
      return publicGetter(instance)
    }

    /**
     * 如果实在没有
     */

    return instance[key]
  },
  set(target, key, value) {
    const { _: instance } = target
    const { setupState, props } = instance

    if (hasOwn(setupState, key)) {
      setupState[key] = value
    }
    return true
  },
}

function setupStatefulComponent(instance) {
  const { type } = instance

  instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers)

  if (isFunction(type.setup)) {
    const setupContext = createSetupContext(instance)
    // 保存 setupContext
    instance.setupContext = setupContext
    const setupResult = type.setup(instance.props, setupContext)
    handleSetupResult(instance, setupResult)
  }

  if (!instance.render) {
    // 如果上面处理完了，instance 还是没有 render，那就去组件中的配置拿
    instance.render = type.render
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    // 返回函数，认定为 render
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    // 返回对象，认定为状态，需要用 proxyRefs 处理
    instance.setupState = proxyRefs(setupResult)
  }
}

/**
 * 创建 setupContext
 * @param instance
 * @returns
 */
function createSetupContext(instance) {
  return {
    // 除了 props 之外的属性
    get attrs() {
      return instance.attrs
    },
    // 处理事件
    emit(event, ...args) {
      emit(instance, event, ...args)
    },
    // 插槽
    slots: instance.slots,
  }
}

function emit(instance, event, ...args) {
  /**
   * 把时间名转换一下
   * foo => onFoo
   * bar => onBar
   */
  const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
  const handler = instance.vnode.props[eventName]
  if (isFunction(handler)) {
    handler(...args)
  }
}
