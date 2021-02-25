// 当前数据是否是对象
export function isObject(data) {
    return typeof data === 'object' && data !== null
}

// 定义一个不可枚举但是可读的属性
export function def(data,key,value) {
    Object.defineProperty(data, key, {
        enumerable:false,   //不可枚举
        configurable:false, //不能被修改
        value
    })
}

// 代理方法
export function proxy(vm, source, key) {
    Object.defineProperty(vm,key, {
        get() {
            // 去vm.name取值，代理到vm._data.name
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}