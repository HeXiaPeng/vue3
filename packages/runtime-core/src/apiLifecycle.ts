import {
  getCurrentInstance,
  setCurrentInstance,
  unsetCurrentInstance,
} from './component'
export enum LifecycleHooks {
  // 挂载 instance.bm
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',

  // 更新
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',

  // 卸载
  BEFORE_UNMOUNT = 'bum',
  UNMOUNT = 'um',
}

function createHook(type) {
  return (hook, target = getCurrentInstance()) => {
    injectHook(target, hook, type)
  }
}

/**
 * 注入生命周期
 * @param target 当前组件实例
 * @param hook 用户传递回调函数
 * @param type 注入生命周期类型
 */
function injectHook(target, hook, type) {
  // 一开始无值，创建一个数组
  if (target[type] == null) {
    target[type] = []
  }

  /**
   * 重写了一下，确保用户能访问到 currentInstance
   */
  const _hook = () => {
    setCurrentInstance(target)
    hook()
    unsetCurrentInstance()
  }

  target[type].push(_hook)
}

// 挂载
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
// 更新
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
// 卸载
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNT)

/**
 * 触发生命周期狗子
 * @param instance 当前组件实例
 * @param type 生命周期类型 bm m bu bum
 */
export function triggerHooks(instance, type) {
  const hooks = instance[type]

  if (hooks) {
    // 如果有，依次执行
    hooks.forEach(hook => hook())
  }
}
