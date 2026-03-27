function createInvoker(value) {
  /**
   * 创建一个事件处理函数，内部调用 invoker.value
   * 如果需要更新时间，那么后续直接修改 invoker.value 完成事件换绑
   * @param e
   */
  const invoker = e => {
    invoker.value(e)
  }
  invoker.value = value
  return invoker
}

const veiKey = Symbol('_vei')
/**
 * const fn1() => {console.log('更新前')}
 * const fn2() => {console.log('更新后')}
 * click el.addEventListener('click', () => {fn1 (e)})
 */
export function patchEvent(el, rawName, nextValue) {
  const name = rawName.slice(2).toLowerCase()

  const invokers = (el[veiKey] ??= {}) // 等于 el._vei = el._vei || {}

  // 拿到之前绑定的 invoker
  const existingInvoker = invokers[rawName]
  if (nextValue) {
    if (existingInvoker) {
      // 如果之前绑定了，那就更新 invoker.value 完成事件换绑
      /**
       * 下一次进来，应该是有值的
       */
      existingInvoker.value = nextValue
      return
    }
    // 创建一个新的 invoker
    const invoker = createInvoker(nextValue)

    invokers[rawName] = invoker
    el.addEventListener(name, invoker)
  } else {
    /**
     * 新事件没有，老的有，就移除事件
     */
    if (existingInvoker) {
      el.removeEventListener(name, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}
