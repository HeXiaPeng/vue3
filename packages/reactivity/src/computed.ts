import { isFunction, hasChange } from '@vue/shared'
import { ReactiveFlags } from './ref'
import { Link, Dependency, Sub, link, startTrack, endTrack } from './system'
import { activeSub, setActiveSub } from './effect'

class ComputedRefImpl implements Dependency, Sub {
  // computed 也是一个 ref， 通过isRef 也返回 true
  [ReactiveFlags.IS_REF] = true

  // 保存 fn 的返回值
  _value

  // 作为 sub，我要知道哪些dep，被我收集了
  subs: Link
  subsTail: Link

  // 作为 dep，要关联 subs，值更新后，通知所有重新执行
  deps: Link | undefined
  depsTail: Link | undefined
  tracking = false

  // 计算属性，脏不脏，如果 dirty 为 true，表示计算属性是脏的，在 get value 时需要执行 update
  dirty = true

  constructor(
    public fn, // getter
    public setter,
  ) {}

  get value() {
    if (this.dirty) {
      // 如果计算属性脏了，重新执行
      this.update()
      // 更新完毕，变为 false
      this.dirty = false
    }
    if (activeSub) {
      link(this, activeSub)
    }
    return this._value
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.log('======>,只读')
    }
  }

  update() {
    /**
     * 实现 sub 的功能，为了在执行 fn 期间，收集 fn 执行过程中访问到的响应式数据
     * 建立 dep 和 sub 之间的关联关系
     */
    // 先将当前的 effect 保存起来，用来处理嵌套逻辑
    const prevSub = activeSub

    // 每次执行 fn 之前，把 this 放到 activeSub 上面
    setActiveSub(this)
    startTrack(this)
    try {
      const oldValue = this._value
      this._value = this.fn()
      return hasChange(this._value, oldValue)
    } finally {
      endTrack(this)
      // 执行完毕，恢复之前的effect
      setActiveSub(prevSub)
    }
  }
}

/**
 * 计算属性
 * @param getterOrOptions 有可能是一个函数，也有可能是一个对象，对象里面可能会有一个 get 或 set 属性
 */
export function computed(getterOrOptions) {
  let getter
  let setter

  if (isFunction(getterOrOptions)) {
    /**
     * const c = computed(() => {})
     */
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
