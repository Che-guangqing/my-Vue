import {initState} from './state'

// 在Vue构造函数的原型上添加初始化init方法
export function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function(options) {
        // console.log(this) //Vue实例
        // 数据劫持
        const vm = this; // vue实例
        // this.$options = 用户传入的配置参数
        vm.$options = options;

        // 初始化状态
        initState(vm);

        // 若传入了el属性 需要将页面渲染出来 实现挂在流程
        // if(vm.$options.el) {
        //     vm.$mount(vm.$options.el)
        // }
    }
    // Vue.prototype.$mount = function (el) {
    //     const vm = this;
    //     const options = vm.$options
    //     el = document.querySelector(el)
    //     // 默认优先级 render, template, el
    //     if(!options.render) {
    //         // 对模板进行编译
    //         let template = options.template
    //         if(!template && el) {
    //             template = el.outerHTML
    //         }
    //         console.log(template, 'ttt')
    //     }
    // }
}
