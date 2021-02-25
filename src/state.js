import {observe} from './observe/index'
import {proxy} from './util/index'
export function initState(vm) {
    const opts = vm.$options
    // vue的数据来源 属性 方法 数据 计算属性 watch
    if(opts.props) {
        initProps(vm)
    }
    if(opts.methods) {
        initMethods(vm)
    }
    if(opts.data) {
        initData(vm)
    }
    if(opts.computed) {
        initComputed(vm)
    }
    if(opts.watch) {
        initWatch(vm)
    }
}
function initProps() {}
function initMethods() {}

function initData(vm) {
    // console.log(vm.$options.data)
    // 数据初始化

    //用户传递的data 可能是对象或函数
    let data = vm.$options.data;
    // 如果拿到的值是函数 就执行它 并且this指向vue实例 并且为了让用户拿到data去修改等操作 把data放在vue实例上
    data = vm._data = typeof data === 'function' ? data.call(vm):data
    // console.log(data) //对象data

    // 对象劫持  用户改变了数据 我可以收到通知进行刷新页面（数据可以驱动视图变化）
    // Object. ()  给属性添加get、set方法

    // 可以直接vm.属性、方法进行取值 代理
    for (let key in data) {
        proxy(vm, '_data', key) 
    }

    observe(data) //响应式原理
}
function initComputed() {}
function initWatch() {}
