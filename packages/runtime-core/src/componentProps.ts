import { hasOwn, isArray } from '@vue/shared'
import { reactive } from '@vue/reactivity'

export function normalizePropsOptions(props = {}) {
  /**
   * 数组转换为对象
   * ['msg', 'count']
   * =>
   * {'msg': true, 'count': true}
   */
  if (isArray(props)) {
    return props.reduce((prev, cur) => {
      prev[cur] = {}
      return prev
    }, {})
  }
  return props
}

/**
 * 设置所有 props 的 attrs
 * @param instance
 * @param rawProps
 * @param props
 * @param attrs
 */
function setFullProps(instance, rawProps, props, attrs) {
  const propsOptions = instance.propsOption
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]

      if (hasOwn(propsOptions, key)) {
        // 如果 propsOptions 有，就更新
        props[key] = value
      } else {
        // 否则就是 attrs 里的
        attrs[key] = value
      }
    }
  }
}

export function initProps(instance) {
  const { vnode } = instance
  const rawProps = vnode.props

  const props = {}
  const attrs = {}
  setFullProps(instance, rawProps, props, attrs)
  // props 是响应式的
  instance.props = reactive(props)
  // attrs 不是响应式的
  instance.attrs = attrs
  return
}

export function updateProps(instance, nextVNode) {
  const { props, attrs } = instance

  const rawProps = nextVNode.props
  /**
   * 设置所有的
   */
  setFullProps(instance, rawProps, props, attrs)

  /**
   * props = {msg: 'hello', age: 0}
   * rawProps = {age: 0}
   * 删除之前有，现在没有的
   */
  for (const key in props) {
    if (!hasOwn(rawProps, key)) {
      delete props[key]
    }
  }

  for (const key in attrs) {
    if (!hasOwn(rawProps, key)) {
      delete props[key]
    }
  }
}
