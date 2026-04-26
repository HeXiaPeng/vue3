import { ref } from '@vue/reactivity'
import { h } from './h'
import { isFunction } from '@vue/shared'
import { time } from 'node:console'

export function defineAsyncComponent(options) {
  if (isFunction(options)) {
    // 传了一个函数，变为一个对象
    options = {
      loader: options,
    }
  }

  const defaultComponent = () => h('span', null, '')
  const {
    loader,
    loadingComponent = defaultComponent,
    errorComponent = defaultComponent,
    timeout,
  } = options

  return {
    setup(props, { attrs, slots }) {
      const component = ref(loadingComponent)

      function loadComponent() {
        return new Promise((reslove, reject) => {
          if (timeout && timeout > 0) {
            setTimeout(() => {
              // promise 的状态是不可逆的
              reject('超时了')
            }, timeout)
          }
          loader().then(reslove, reject)
        })
      }
      /**
       * loader 返回一个 Promise，如果这个 Promise 在 timeout 之内没有完成，就报错
       */

      loadComponent().then(
        comp => {
          if (comp && comp[Symbol.toStringTag] === 'Module') {
            // @ts-ignore
            comp = comp.default
          }
          // 组件加载成功了
          console.log('组件加载成功了 ', comp)
          component.value = comp
        },
        err => {
          console.log(err)
          // 加载失败
          component.value = errorComponent
        },
      )

      return () => {
        return h(
          component.value,
          {
            ...attrs,
            ...props,
          },
          slots,
        )
      }
    },
  }
}
