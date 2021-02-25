import {initMixin} from './init'     //初始化方法
import {renderMixin} from './render'  // 渲染虚拟dom
import {lifecycleMixin} from './lifecycle'  // 更新视图

function Vue(options) {
    // vue初始化操作
    this._init(options)
}

// 通过引入文件的方式给Vue原型上添加方法
// 导入init方法 
initMixin(Vue)

// 渲染虚拟dom
renderMixin(Vue)

lifecycleMixin(Vue)

export default Vue