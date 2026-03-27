import { patchProp } from './patchProps'
import { nodeOps } from './nodeOps'
import { createRenderer } from '@vue/runtime-core'

export * from '@vue/runtime-core'

const renderOptions = { patchProp, ...nodeOps }

const renderer = createRenderer(renderOptions)
export function render(vnode, container) {
  createRenderer.render(vnode, container)
}

export { renderOptions }
