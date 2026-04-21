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
export function createComponentInstance(vnode, parent) {
  const { type } = vnode

  // 跟组件没有 parent, 就从 vnode.appContext 中拿
  const appContext = parent ? parent.appContext : vnode.appContext

  const instance: any = {
    type,
    vnode,
    // createApp  产生的 appContext
    appContext,
    // 父组件
    parent,
    render: null,
    // setup 返回的状态
    setupState: null,
    /**
     * 用户声明的组件 props
     */
    propsOptions: normalizePropsOptions(type.props),
    props: {},
    attrs: {},
    // 组件的插槽
    slots: {},
    refs: {},
    // 子树，就是 render 的返回结果
    subTree: null,
    isMounted: false,
    provides: parent ? parent.provides : appContext.provides,
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
    if (setupState != null && hasOwn(setupState, key)) {
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

    /**
     * 设置当前组件实例
     */
    setCurrentInstance(instance)
    // 执行 setup 函数
    const setupResult = type.setup(instance.props, setupContext)

    /**
     * 清楚当前组件实例
     */
    unsetCurrentInstance()
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
    // 暴露属性
    expose(exposed) {
      // 把用户传递的对象，保存到当前实例上
      instance.exposed = exposed
    },
  }
}

/**
 * 获取组件公开的属性
 * @param instance
 * @returns
 */
export function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    /**
     * 用户可以访问 exposed 和 publicPropertiesMap
     */

    // 查看是否有缓存
    if (instance.exposedProxy) return instance.exposedProxy
    // 创建一个代理对象
    instance.exposedProxy = new Proxy(proxyRefs(instance.exposed), {
      get(target, key) {
        if (key in target) {
          // expose 中的属性
          return target[key]
        }

        if (key in publicPropertiesMap) {
          // $el $props $attrs
          return publicPropertiesMap[key](instance)
        }
      },
    })
    return instance.exposedProxy
  } else {
    // 如果没有手动暴露，就返回代理对象
    return instance.proxy
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

let currentInstance = null

/**
 * 设置当前组件实例
 * @param instance
 */
export function setCurrentInstance(instance) {
  currentInstance = instance
}

/**
 * 获取当前组件实例
 * @returns
 */
export function getCurrentInstance() {
  return currentInstance
}

export function unsetCurrentInstance() {
  currentInstance = null
}
