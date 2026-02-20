import { activeSub } from './effect'
enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

/**
 * Ref 的类
 */
class RefImpl {
  // 保存实际的值
  _value;
  // ref 标记，证明是一个 ref
  [ReactiveFlags.IS_REF] = true

  // 保存和 effect 之间的关系
  subs
  constructor(value) {
    this._value = value
  }

  get value() {
    // 收集依赖
    console.log('有人访问我了', activeSub)
    if (activeSub) {
      this.subs = activeSub
    }
    return this._value
  }

  set value(newValue) {
    // 触发依赖
    this._value = newValue

    // 通知 effect 重新执行，获取最新的值
    this.subs?.()
  }
}

export function ref(value) {
  return new RefImpl(value)
}

/**
 * 判断是否为 ref
 * @param value
 * @returns
 */
export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
