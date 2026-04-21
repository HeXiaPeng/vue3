import { h } from './h'
export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps) {
    const context = {
      // app 往后代属性注入的东西 provide 注入的属性，会存到这里
      provides: {},
    }

    const app = {
      _container: null,
      mount(container) {
        /**
         * 根组件
         * 要挂载的容器
         */
        // 创建组件的虚拟节点
        const vnode = h(rootComponent, rootProps)
        vnode.appContext = context
        // 将组件的虚拟节点挂载到 container 上
        render(vnode, container)
        app._container = container
      },
      unmount() {
        // 卸载
        render(null, app._container)
      },
      provide(key, value) {
        context.provides[key] = value
      },
    }
    return app
  }
}
