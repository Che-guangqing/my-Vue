import {isObject, def} from '../util/index'
import {arraryMethods} from './array'

// 观测数据
class Observe {
    constructor(value) {
        this.walk(value)
        // console.log(value)
        // vue如果数据层次过多 则递归解析对象中的属性 ，依次添加set get方法
        // value.__ob__ = this  //给每一个监控过的对象都添加一个__ob__ 属性  但是这样写会一直递归调用observeArray方法
        // def(value,'__ob__ ', this)
        // if(Array.isArray(value)) {
        //     // 如果属性是数组,则不使用数组的索引添加get set进行观察 性能不好 
        //     // 如果是unishit push等方法让数组发生变化 则重写这些方法
        //     value.__proto__ = arraryMethods
            
        //     // 如果数组里面是对象我再进行监测
        //     this.observeArray(value)
        // }else {
        //     //对对象进行观测
        //     this.walk(value)
        // }
    }
    //数组
    observeArray(value) {
        for(let i = 0 ;i < value.length; i++) {
            // [{}] 监控了数组里面的对象
            observe(value[i])
        }
    }
    //对象
    walk(data) {
        let keys = Object.keys(data) // [name,age,address]
        keys.forEach(key => {
            defineReactive(data, key, data[key])
        })
        // for(let i = 0 ;i <keys.length; i++) {
        //     // 遍历拿到对象中的属性和值 
        //     let key = keys[i]
        //     let value =  data[key]
        //     // 给每个属性定义响应式数据
        //     defineReactive(data, key, value)
        // }
    }
}

// 定义响应式数据
function defineReactive(data, key, value) {
    //                (给谁，定义某个key，值是多少)
    // 递归实现深度监测 如果对象里面还是对象，不递归只能监测一层数据的变化 用observe方法再判断再循环属性添加set get方法
    observe(value)

    Object.defineProperty(data, key , {
        //取值
        get() {
            return value
        },
        //设置值
        set(newValue) {
            console.log('更新数据')
            if (value === newValue) return;
            // 值发生变化

            // 如果原来的属性是a:{b:1,c:2} 用户这样赋值 a:{a:2}还是监测不到
            // 继续劫持用户设置的值 因为有可能用户设置的值是对象 对象劫持
            observe(newValue)

            // console.log('值发生变化')
            value = newValue
        }
    })
}



// 响应式原理 观测数据是否变化
// 把data中的数据都使用 Object.definedProperty()重新定义
export function observe(data) {
    // console.log(data, 'observe')
    let isObj = isObject(data) //是否对象
    // console.log(isObj)
    //不是对象
    if(!isObj) { return }
    // 是对象
    return new Observe(data) //用来观测数据
}