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
