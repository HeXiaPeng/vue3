import { patchProp } from './patchProps'
import { nodeOps } from './nodeOps'

export * from '@vue/runtime-core'

const renderOptions = { patchProp, ...nodeOps }

export { renderOptions }
