(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // 当前数据是否是对象
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  } // 定义一个不可枚举但是可读的属性

  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      //不可枚举
      configurable: false,
      //不能被修改
      value: value
    });
  }

  // 需要重写能够改变原数组的方法 push shift unshift pop reverse sort splice
  // slice不会改变原数组不需要劫持
  // 先把数组原来的方法保存
  var oldArraryMethods = Array.prototype; // arr.__proto__ = arraryMethods 用户使用
  // arraryMethods.__proto__ = oldArraryMethods
  // 使用方法时：原型链查找，先查找重写的，在重写的方法中找不到，会继续向上查找

  var arraryMethods = Object.create(oldArraryMethods);
  var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
  methods.forEach(function (methods) {
    arraryMethods[methods] = function () {
      console.log("\u8C03\u7528\u4E86".concat(methods, "\u65B9\u6CD5")); // 我调用重写的数组方法 这个方法调用原生的数组方法   AOP切片编程
      // 这里的this，就是谁调用的方法就指向谁，也就是Observe中的value调用的

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArraryMethods[methods].apply(this, args); // push unshif方法，添加的元素可能还是对象，要继续监听
      //当前用户插入的元素

      var inserted;
      var ob = this.__ob__; // console.log(ob, 'arrrr')

      switch (methods) {
        case 'push':
        case 'unshift':
          inserted = args; // arr.push({a:1},{b:2})
          // inserted = [{a:1},{b:2}]

          break;

        case 'splice':
          //有删除、修改、新增功能 (操作的数组元素,操作的索引,新增的属性) arr.splice(0,1,'b')
          // 对于splice新增的属性也要看
          inserted = args.slice(2);
          break;
      } // console.log(inserted, '当前用户插入的元素')
      // 添加了值


      if (inserted) {
        // 观测inserted数组
        // 要使用index.js中循环数组元素监测的方法
        ob.observeArray(inserted); //将新增属性继续观测
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(value) {
      _classCallCheck(this, Observe);

      // console.log(value)
      // vue如果数据层次过多 则递归解析对象中的属性 ，依次添加set get方法
      // 给每一个监控过的对象都添加一个__ob__属性，但是这样写会一直递归调用observeArray方法
      // value.__ob__ = this
      // Object.defineProperty(value, '__ob__', {
      //     enumerable:false,   //不可枚举
      //     configurable:false, //不能被修改
      //     value: this
      // })
      def(value, '__ob__', this);

      if (Array.isArray(value)) {
        // 如果属性是数组,则不使用数组的索引添加get set进行观察、性能不好 
        // push shift unshift pop reverse sort splice这些方法也能使原数组发生变化
        // 所以对于这些方法让数组发生变化，也需要知道他变了去通知视图改变，则重写这些方法
        value.__proto__ = arraryMethods; // 如果数组里面是对象[{}]我再进行监测

        this.observeArray(value);
      } else {
        //对对象进行观测
        this.walk(value);
      }
    } //遍历数组


    _createClass(Observe, [{
      key: "observeArray",
      value: function observeArray(value) {
        for (var i = 0; i < value.length; i++) {
          // [{}] 监控了数组里面的对象
          observe(value[i]);
        }
      } //遍历对象

    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data); // [name,age,address]

        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        }); // for(let i = 0 ;i <keys.length; i++) {
        //     // 遍历拿到对象中的属性和值 
        //     let key = keys[i]
        //     let value =  data[key]
        //     // 给每个属性定义响应式数据
        //     defineReactive(data, key, value)
        // }
      }
    }]);

    return Observe;
  }(); // 定义响应式数据


  function defineReactive(data, key, value) {
    //                (给谁，定义某个key，值是多少)
    // 递归实现深度监测 如果对象里面还是对象，不递归只能监测一层数据的变化 用observe方法再判断再循环属性添加set get方法
    observe(value);
    Object.defineProperty(data, key, {
      //取值
      get: function get() {
        return value;
      },
      //设置值
      set: function set(newValue) {
        console.log('更新数据');
        if (value === newValue) return; // 值发生变化
        // 如果原来的属性是a:{b:1,c:2} 用户这样赋值 a:{a:2}还是监测不到
        // 继续劫持用户设置的值 因为有可能用户设置的值是对象 对象劫持

        observe(newValue); // console.log('值发生变化')

        value = newValue;
      }
    });
  } // 响应式原理 观测数据是否变化
  // 把data中的数据都使用 Object.definedProperty()重新定义


  function observe(data) {
    // console.log(data, 'observe')
    var isObj = isObject(data); //是否对象
    // console.log(isObj)
    //不是对象

    if (!isObj) {
      return;
    } // 是对象


    return new Observe(data); //用来观测数据
  }

  function initState(vm) {
    var opts = vm.$options; // vue的数据来源 属性 方法 数据 计算属性 watch

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // console.log(vm.$options.data)
    // 数据初始化
    //用户传递的data 可能是对象或函数
    var data = vm.$options.data; // 如果拿到的值是函数 就执行它 并且this指向vue实例 并且为了让用户拿到data去修改等操作 把data放在vue实例上

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // console.log(data) //对象data
    // 对象劫持  用户改变了数据 我可以收到通知进行刷新页面（数据可以驱动视图变化）
    // Object. ()  给属性添加get、set方法

    observe(data); //响应式原理
  }

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // console.log(this) //Vue实例
      // 数据劫持
      var vm = this; // vue实例
      // this.$options = 用户传入的配置参数

      vm.$options = options; // 初始化状态

      initState(vm); // 若传入了el属性 需要将页面渲染出来 实现挂在流程
      // if(vm.$options.el) {
      //     vm.$mount(vm.$options.el)
      // }
    }; // Vue.prototype.$mount = function (el) {
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

  function Vue(options) {
    // vue初始化操作
    this._init(options);
  } // 通过引入文件的方式给Vue原型上添加方法
  // 导入init方法 


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
