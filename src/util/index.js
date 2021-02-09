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