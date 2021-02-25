import Watcher from './observe/watcher'

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        // 拿到虚拟节点vnode，创建出真实dom 更新视图
    }
}

// 挂载组件
export function mountComponent(vm, el) {
    const options = vm.$options
    vm.$el = el  //真实的dom元素
    // console.log(options, vm.$el)

    /* 
    Watcher就是用来渲染的
    vm._render 通过解析的render方法 渲染出虚拟dom
    vm._update 通过虚拟dom 创建真实dom
    */

    // 渲染页面
    let updateComponent = () => {
        // 无论是渲染还是更新都会调用此方法

        // 返回的是虚拟dom => 生成真实dom
        vm._update(vm._render())
    }

    // 渲染watcher 每个组件都有一个watcher,响应式原理，每次数据变调用updateComponent方法更新视图
    //         实例， 更新组件方法， 回调
    new Watcher(vm, updateComponent, () => {}, true) 
    // true表示他是一个渲染watch

}