export const isTeleport = type => type.__isTeleport

export const Teleport = {
  name: 'Teleport',
  // Teleport组件标识
  __isTeleport: true,
  props: {
    to: {
      // 要挂载的选择器为 to 的容器中
      type: String,
    },
    disabled: {
      // s是否禁用
      type: Boolean,
    },
  },
  process(n1, n2, container, anchor, parentComponent, internals) {
    const {
      mountChildren,
      patchChildren,
      options: { querySelector, insert },
    } = internals

    const { disabled, to } = n2.props

    /**
     * 1. 挂载
     * 2. 更新
     */
    if (n1 == null) {
      // 挂载
      /**
       * 把 n2.children 挂载到选择器为 to 的容器中
       */
      // 如果禁用，就
      const target = disabled ? container : querySelector(to)
      if (target) {
        // 把 n2.children 挂载到 container 上，否则就根据 to 这个选择器查询 dom
        n2.target = target
        mountChildren(n2.children, target, parentComponent)
      }
    } else {
      // 更新
      patchChildren(n1, n2, n1.target, parentComponent)
      n2.target = n1.target

      const prevProps = n1.props
      if (prevProps.to !== to || disabled !== prevProps.disabled) {
        /**
         * 发生变化的条件：
         * 1. to 发生来变化，将原来的子节点移动到新的 target 下面去
         * 2. disabled 发生来变化
         */
        const target = disabled ? container : querySelector(to)
        for (const child of n2.children) {
          insert(child.el, target)
        }
        // 重新设置新的 target
        n2.target = target
      }
    }
  },
}
