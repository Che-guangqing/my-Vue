import {initMixin} from './init'

function Vue(options) {
    // vue初始化操作
    this._init(options)
}

// 通过引入文件的方式给Vue原型上添加方法
// 导入init方法 
initMixin(Vue)

export default Vue