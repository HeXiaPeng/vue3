export function patchStyle(el, prevValue, nextValue) {
  const style = el.style
  if (nextValue) {
    /**
     * 把新的样式全部生效，设置到 style 中
     */
    for (const key in nextValue) {
      style[key] = nextValue[key]
    }
  }

  if (prevValue) {
    /**
     * 去除之前有的，现在没有的
     */
    for (const key in prevValue) {
      if (nextValue?.[key] == null) {
        style[key] = null
      }
    }
  }
}
