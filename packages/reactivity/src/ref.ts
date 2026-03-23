import { hasChange, isObject } from '@vue/shared'
import { activeSub } from './effect'
import { Dependency, Link, link, propagate } from './system'
import { reactive } from 'vue'
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
