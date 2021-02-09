// 需要重写能够改变原数组的方法 push shift unshift pop reverse sort splice
// 先把数组原来的方法保存
let oldArraryMethods = Array.prototype
// value.__proto__ = arraryMethods
// arraryMethods.__proto__ = oldArraryMethods
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
        console.log('调用了方法')
        // 我调用重写的数组方法 这个方法调用原生的数组方法   AOP切片编程
        const result = oldArraryMethods[methods].apply(this, ...args)
        // push unshif添加的元素可能还是对象 
        let inserted; //当前用户插入的元素
        let ob = this.__ob__
        console.log(ob, 'arrrr')
        switch (methods) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice': //操作的数组 操作的索引 新增的属性 arr.splice(0,1,'b')
                inserted = args.slice(2)
                break;
        }
        // 添加了值
        if(inserted) {
            // ob.observeArray(inserted) //将新增属性继续观测
        }
        return result
    }
})