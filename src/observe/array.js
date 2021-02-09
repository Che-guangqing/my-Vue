// 需要重写能够改变原数组的方法 push shift unshift pop reverse sort splice
// slice不会改变原数组不需要劫持

// 先把数组原来的方法保存
let oldArraryMethods = Array.prototype
// arr.__proto__ = arraryMethods 用户使用
// arraryMethods.__proto__ = oldArraryMethods
// 使用方法时：原型链查找，先查找重写的，在重写的方法中找不到，会继续向上查找
export const arraryMethods = Object.create(oldArraryMethods)
const methods = [
    'push', 
    'shift',
    'unshift' ,
    'pop' ,
    'reverse' ,
    'sort' ,
    'splice'
]
methods.forEach(methods => {
    arraryMethods[methods] = function (...args) {
        console.log(`调用了${methods}方法`)
        // 我调用重写的数组方法 这个方法调用原生的数组方法   AOP切片编程
        // 这里的this，就是谁调用的方法就指向谁，也就是Observe中的value调用的
        const result = oldArraryMethods[methods].apply(this, args)

        // push unshif方法，添加的元素可能还是对象，要继续监听
        //当前用户插入的元素
        let inserted;
        let ob = this.__ob__
        // console.log(ob, 'arrrr')

        switch (methods) {
            case 'push':
            case 'unshift':
                inserted = args
                // arr.push({a:1},{b:2})
                // inserted = [{a:1},{b:2}]
                break;
            case 'splice': //有删除、修改、新增功能 (操作的数组元素,操作的索引,新增的属性) arr.splice(0,1,'b')
               // 对于splice新增的属性也要看
                inserted = args.slice(2)
                break;
        }
        // console.log(inserted, '当前用户插入的元素')
        // 添加了值
        if(inserted) {
            // 观测inserted数组
            // 要使用index.js中循环数组元素监测的方法
            ob.observeArray(inserted) //将新增属性继续观测
        } 

        return result
    }
})