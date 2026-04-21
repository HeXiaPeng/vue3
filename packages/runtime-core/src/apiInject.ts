import { getCurrentInstance } from './component'

export function provide(key, value) {
  /**
   * count => 0
   */

  /**
   * 首次调用的时候，instance.provides 应该等于 parent.provides
   */
  const instance = getCurrentInstance()
  const parentProvides = instance.parent
    ? instance.parent.provides
    : instance.appContext.provides
  // 设置属性到 provides 上
  let provides = instance.provides
  if (provides === parentProvides) {
    // 只有使用了 provide 的组件才会使用Object.create，减少原型链的查找
    instance.provides = Object.create(parentProvides)
    provides = instance.provides
  }
  provides[key] = value
}

export function inject(key, defaultValue) {
  const instance = getCurrentInstance()
  // 拿到父组件的 provides，如果父组件没有，那就拿app的
  const parentProvides = instance.parent
    ? instance.parent.provides
    : instance.appContext.provides

  if (key in parentProvides) {
    // 如果父组件 provides 上有这个 key，那就返回
    return parentProvides[key]
  }

  // 如果找不到值，返回默认值
  return defaultValue
}
