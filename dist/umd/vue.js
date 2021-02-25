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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
  } // 代理方法

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        // 去vm.name取值，代理到vm._data.name
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
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
    // 可以直接vm.属性、方法进行取值 代理

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data); //响应式原理
  }

  // ?:  匹配不捕获
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // console.log(`aaa = '123'`.match(attribute))

  var ncname = '[a-zA-Z_][\\w\\-\\.]*'; // abc-aa

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <aaa:bfsf>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 <div />

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // </xxx> 标签结尾
  // ast语法树树根

  var root = null; // 保存当前标签的父级

  var currentParent; // 每次匹配到后入栈，当遇到结束标签查看与上一个是否匹配，匹配两个一起出栈 [div, p, /p] p结束 => [div, /div] => [] div结束, 若最后栈中还有则不符合规范 

  var stack = []; // 标签元素

  var ELEMENT_TYPE = 1; // 文本元素

  var TEXT_TYPE = 3; // 创建AST树

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }

  function start(tagName, attrs) {
    // console.log('开始标签:',tagName, '属性是:',attrs)
    // 遇到开始标签，就创建一个ast元素
    var element = createASTElement(tagName, attrs);

    if (!root) {
      root = element;
    } // 把当前元素标记成父ast树


    currentParent = element; // 将当前标签存入栈中

    stack.push(element);
  } // 空格字符或者文本


  function chars(text) {
    // console.log('文本是:',text)
    // 空
    text = text.replace(/\s/g, '');

    if (text) {
      currentParent.children.push({
        text: text,
        type: TEXT_TYPE
      });
    }
  } // <div><p>  [div,p]


  function end(tagName) {
    // console.log('结尾标签:',tagName)
    // 比较栈中最后一个元素和当前元素是否匹配
    // 得到的是ast对象
    var element = stack.pop(); // 标识当前这个p是属于这个div的儿子的

    currentParent = stack[stack.length - 1];

    if (currentParent) {
      // 有父级
      element.parent = currentParent;
      currentParent.children.push(element); //实现树的父子关系
    }
  } // 匹配字符串 html => ast树


  function parseHTML(html) {
    // 不停的解析html字符串
    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        // 若当前索引为0，肯定是标签，要么开始标签，要么结束标签
        // 通过此方法获取匹配结果，标签名和属性
        var startTagMatch = parseStartTag(); // 若匹配到开始

        if (startTagMatch) {
          // （1）解析开始标签
          start(startTagMatch.tagName, startTagMatch.attrs); // console.log(startTagMatch)
          // 如果开始标签匹配完毕，继续下一次匹配

          continue;
        } // 不走上面if，就是结尾标签


        var endTagMatch = html.match(endTag); // 若匹配到结尾

        if (endTagMatch) {
          advance(endTagMatch[0].length); // （3）解析结束标签

          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        // 文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length); // （2）解析文本标签

        chars(text);
      }
    } // <div>jfck</div>
    // 匹配到<div>，就删掉<div>,向后继续截取


    function advance(n) {
      html = html.substring(n);
    } // 解析开始标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; // 匹配到就在原html中删除, 删除标签

        advance(start[0].length); // 匹配结束标签

        var _end, attr; // 匹配不到标签结束 /> 


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 将属性去掉
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        } // 就是匹配到上一步 去掉开始标签的 >


        if (_end) {
          advance(_end[0].length);
          return match;
        } // console.log(html, match)
        // console.log(start)
        // console.log(html)

      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{}}
  // 处理属性 

  function genProps(attrs) {
    // [{name:'id',value:'app'}, {}]  => {id:app,a:1,b:2}
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          // style="color: red ; fontSize:14px" => {style: {color:'red'},id:app,}
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value; // console.log(obj)
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    } // 包装成对象，去掉最后的逗号


    return "{".concat(str.slice(0, -1), "}");
  } // 孩子节点处理 递归！


  function genChildren(el) {
    var children = el.children;

    if (children && children.length > 0) {
      // _c('span),_c('span),_c('span)
      return "".concat(children.map(function (c) {
        return gen(c);
      }).join(','));
    } else {
      return false;
    }
  }

  function gen(node) {
    // node: 遍历children拿到的一个个节点对象
    if (node.type == 1) {
      // 元素标签
      return generate(node);
    } else {
      // 文本节点
      var text = node.text; // a {{name}} b{{age}} c => _v("a" + _s(name) + "b" +_s(age) + c)
      // let reg = /a/g => reg.test('abc') true => reg.test('abc') false => reg.lastIndex = 0 => reg.test('abc') true
      // esec 正则的问题 lastIndex
      // 难难难！！！ 没理解

      var tokens = []; //匹配到的{{name}}元素

      var match, index; // 每次的偏移量

      var lastIndex = defaultTagRE.lastIndex = 0;

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  } // 标签


  function generate(el) {
    // 生成孩子
    var children = genChildren(el);
    var code = "_c(\"".concat(el.tag, "\", ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined').concat(children ? ", ".concat(children, " ") : '', ")\n    ");
    return code;
  }

  function compileToFunction(template) {
    // console.log(template)
    // <1>、解析html,把html字符串变成ast语法树  (正则匹配HTML标签属性文本 + 循环)
    var root = parseHTML(template); // console.log(root)

    var code = generate(root); // console.log(code)
    // 将ast语法树生成最终的render函数  就是字符串拼接（模板引擎）
    // render函数返回的是虚拟dom
    // 核心思路：将模板转换成下面字符串
    // <div id="app">
    //     <h1>hello {{name}}</h1>
    //     hello
    // </div>
    // 将ast树再次转换成js语法
    // _c('div',{id:app}, _c("p",udefined,_v('hello' + _s(name) )),  _v('hello))
    // 所有的模板引擎实现 都要new Function + with

    var renderFn = new Function("with(this) {return ".concat(code, "}")); // 相当于
    // function () {
    // renderFn.call(谁),this就是谁
    //     with(this) {
    //         return _c('div',{id:app}, _c("p",udefined,_v('hello' + _s(name) )),  _v('hello))
    //     }
    // }
    // console.log(renderFn)

    return renderFn;
  } // 先把html字符串转成AST语法树，再把ast语法树转成render函数

  /*
  <div id="app">
      <h1>hello</h1>
  </div>

  // AST抽象语法树
  let root = {
      tag: 'div',
      attrs: [
          { name: 'id', value: 'app' }
      ],
      parent: null,
      type:1,
      children: [
          {
              tag: 'p',
              attrs: [],
              parent: root,
              type:1,
              children: [
                  { text: 'hello', type:3 }
              ]
          }
      ]
  }
  */
  // 拼接字符串 + with + new Function

  var Watcher = function Watcher() {
    _classCallCheck(this, Watcher);
  };

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {// 拿到虚拟节点vnode，创建出真实dom 更新视图
    };
  } // 挂载组件

  function mountComponent(vm, el) {
    var options = vm.$options;
    vm.$el = el; //真实的dom元素
    // console.log(options, vm.$el)

    /* 
    Watcher就是用来渲染的
    vm._render 通过解析的render方法 渲染出虚拟dom
    vm._update 通过虚拟dom 创建真实dom
    */
    // 渲染页面

    var updateComponent = function updateComponent() {
      // 无论是渲染还是更新都会调用此方法
      // 返回的是虚拟dom => 生成真实dom
      vm._update(vm._render());
    }; // 渲染watcher 每个组件都有一个watcher,响应式原理，每次数据变调用updateComponent方法更新视图
    //         实例， 更新组件方法， 回调


    new Watcher(vm, updateComponent, function () {}, true); // true表示他是一个渲染watch
  }

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // console.log(this) //Vue实例
      // 数据劫持
      var vm = this; // vue实例
      // this.$options = 用户传入的配置参数

      vm.$options = options; // 初始化状态

      initState(vm); // 若传入了el属性 需要将页面渲染出来 实现挂载流程

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // console.log(el)
      // 默认优先级 render, template, el

      if (!options.render) {
        // 对模板进行编译
        var template = options.template; //   并且有 el

        if (!template && el) {
          template = el.outerHTML;
        } // console.log(template, 'outerHTML')
        // 将template转换成render方法 AST语法树


        var render = compileToFunction(template);
        options.render = render;
      } // 传了render函数用传的，没传用if里面编译后的
      // options.render
      // 渲染当前的组件 挂在这个组件


      mountComponent(vm, el);
    };
  }
  /*
  <div id="app">
      <h1>{{name}}</h1>
      <h3>{{age}}</h3>
  </div>
  render函数
  render() {
      return _c('div', {id:'app'}, _c('h1',undefined, _v(_s(name))), _c('h3',undefined,_v(_s())))
  }
  */

  function createElement(tag, data) {
    var _console;

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    (_console = console).log.apply(_console, [tag, data].concat(children));
  }
  function createTextNode(text) {}

  function renderMixin(Vue) {
    // _c 创建元素的虚拟节点
    // -v 创建文本的虚拟节点
    // _s JSON.stringify
    Vue.prototype._c = function () {
      // tag,data,children1,children2
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._v = function (text) {
      return createTextNode();
    };

    Vue.prototype._s = function (val) {
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      render.call(vm); // 去实例上取值
    };
  }

  function Vue(options) {
    // vue初始化操作
    this._init(options);
  } // 通过引入文件的方式给Vue原型上添加方法
  // 导入init方法 


  initMixin(Vue); // 渲染虚拟dom

  renderMixin(Vue);
  lifecycleMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
