import { Link } from './system'
// 保存当前正在执行的 effect
export let activeSub

class ReactiveEffect {
  /**
   * 依赖想链表的头节点
   */
  deps: Link | undefined

  /**
   * 依赖像链表的尾节点
   */
  depsTail: Link | undefined
  constructor(public fn) {}

  run() {
    // 先将当前的 effect 保存起来，用来处理嵌套逻辑
    const prevSub = activeSub

    // 每次执行 fn 之前，把 this 放到 activeSub 上面
    activeSub = this
    console.log('depsTail ===>')
    this.depsTail = undefined
    try {
      return this.fn()
    } finally {
      // 执行完毕，回复之前的effect
      activeSub = prevSub
    }
  }

  notify() {
    this.scheduler()
  }

  /**
   * 默认调用 run，如果用户传了，那就以用户的为主，实例的属性的优先级>原型属性的优先级
   */
  scheduler() {
    this.run()
  }
}

export function effect(fn, options) {
  const e = new ReactiveEffect(fn)
  // scheduler
  Object.assign(e, options)
  e.run()

  /**
   * 绑定函数的 this，防止 this 丢失
   */
  const runner = e.run.bind(e)
  runner.effect = e
  return runner
}
