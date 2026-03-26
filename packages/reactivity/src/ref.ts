import { hasChange, isObject } from '@vue/shared'
import { activeSub } from './effect'
import { Dependency, Link, link, propagate } from './system'
import { reactive } from './reactive'
export enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

/**
 * Ref 的类
 */
class RefImpl implements Dependency {
  // 保存实际的值
  _value;
  // ref 标记，证明是一个 ref
  [ReactiveFlags.IS_REF] = true

  // 订阅者链表的头节点
  subs: Link

  // 订阅者链表的尾节点，
  subsTail: Link
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value
  }

  get value() {
    // 收集依赖
    // console.log('有人访问我了', activeSub)
    if (activeSub) {
      trackRef(this)
    }
    return this._value
  }

  set value(newValue) {
    const oldValue = this._value
    if (hasChange(newValue, oldValue)) {
      // 触发依赖
      this._value = newValue
      traggerRef(this)
    }
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

/**
 * 收集依赖， 建立 ref 和 effect 之间的关联关系
 * @param dep
 */
export function trackRef(dep) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

/**
 * 触发 ref 关联的 effect 重新执行
 * @param dep
 */
export function traggerRef(dep) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}

class ObjectRefImpl {
  [ReactiveFlags.IS_REF] = true
  constructor(
    public _object,
    public _key,
  ) {}

  get value() {
    return this._object[this._key]
  }
  set value(newValue) {
    this._object[this._key] = newValue
  }
}

export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(target) {
  const res = {}

  for (const key in target) {
    res[key] = new ObjectRefImpl(target, key)
  }

  return res // name => ObjectRefImpl, age => ObjectRefImpl
}

export function unref(value) {
  return isRef(value) ? value.value : value
}

/**
 * 使用 proxyRefs 不用每次都使用 value(p.value.parm => p.parm)
 * @param target
 * @returns
 */
export function proxyRefs(target) {
  return new Proxy(target, {
    get(...args) {
      /**
       * 自动解包 ref
       * 如果这个 target[key] 是一个 ref，那就返回 ref.value, 否则返回 target[key]
       */
      const res = Reflect.get(...args)

      return unref(res)
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key]
      /**
       * 如果更新了 state.a 它之前是个 ref， 那么就会修改 ref.value 的值等于 newValue
       * 如果 newValue 是一个 ref，那就算了
       */
      if (isRef(oldValue) && !isRef(newValue)) {
        /**
         * const a = ref(0)
         * target = { a }
         * 更新 target.a = 1, 它就等于更新了 a.value
         * a.value = 1
         */
        oldValue.value = newValue
        return true
      }

      return Reflect.set(target, key, newValue, receiver)
    },
  })
}
