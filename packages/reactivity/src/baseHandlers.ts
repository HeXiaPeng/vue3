import { isRef, reactive } from '@vue/reactivity'
import { track, trigger } from './dep'
import { hasChange, isObject } from '@vue/shared'

export const mutableHandlers = {
  get(target, key, receiver) {
    /**
     * 收集依赖，绑定 target 中某一个 key 和sub 之间的关系
     */
    track(target, key)
    const res = Reflect.get(target, key, receiver)

    if (isRef(res)) {
      /**
       * target = {a: ref(0)}
       * receiver 用来保证 访问器里面的 this 指向代理对象
       */
      return res.value
    }

    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  set(target, key, newValue, receiver) {
    const oldValue = target[key]

    //regin 为了处理隐式更新数组
    const targetIsArray = Array.isArray(target)
    const oldLength = targetIsArray ? target.length : 0
    //endregin

    /**
     * 如果更新了 state.a 它之前是个 ref，那么会修改初始的 ref.value 的值，等于 newValue
     * 如果 newValue 是一个 ref ，那就算了
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

    /**
     * 触发更新，set 的时候，通知之前的依赖，重新执行
     */
    const res = Reflect.set(target, key, newValue, receiver)

    if (hasChange(newValue, oldValue)) {
      /**
       * 新值和老值不一样，触发更新
       * 先set，在通知执行
       */
      trigger(target, key)
    }

    const newLength = targetIsArray ? target.length : 0

    if (targetIsArray && newLength !== oldLength && key !== length) {
      /**
       * 隐式更新 length
       * 更新前： length = 4 => ['a', 'b', 'c', 'd']
       * 更新后： length = 5 => ['a', 'b', 'c', 'd', 'e']
       * 更新动作，以 push 为例，追加了一个 e
       * 隐式更新 length 的方法: push, pop, shift, unshift
       */
      trigger(target, 'length')
    }
    return res
  },
}
