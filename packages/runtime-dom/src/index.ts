import { patchProp } from './patchProps'
import { nodeOps } from './nodeOps'
import { createRenderer } from '@vue/runtime-core'
import { isString } from '@vue/shared'

export * from '@vue/runtime-core'

const renderOptions = { patchProp, ...nodeOps }

const renderer = createRenderer(renderOptions)
export function render(vnode, container) {
  renderer.render(vnode, container)
}

export function createApp(rootComponent, rootProps) {
  const app = renderer.createApp(rootComponent, rootProps)
  const _mount = app.mount.bind(app)

  /**
   * 重写 app mount，使用 dom 选择器重选
   * @param selector
   */
  function mount(selector) {
    let el = selector
    if (isString(el)) {
      el = document.querySelector(selector)
    }
    _mount(el)
  }

  app.mount = mount

  return app
}

export { renderOptions }
