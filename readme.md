## 项目依赖及工具
```npm install rollup @babel/core @babel/preset-env rollup-plugin-babel rollup-plugin-serve cross-env -D```

> - rollup：打包工具
> - @babel/core：babel核心模块
> - @babel/preset-env： 将高级语法转换成低级语法
> - rollup-plugin-babel： 桥梁 
> - rollup-plugin-serve：实现静态服务
> - cross-env：设置环境变量

## 目录
**|-- public**
&emsp;&emsp;|--**index.html**
**|-- src**
&emsp;&emsp;|-- **observe** : <small>*响应式, 在state.js文件中 ‘initData(vm)实现data初始化’，此文件实现data的双向绑定<Object.definedProperty():给属性添加get、set方法>*</small>
&emsp;&emsp;&emsp;&emsp;|-- **array.js** :  <small>*重写能够改变原数组的方法*</small>
&emsp;&emsp;&emsp;&emsp;|-- **index.js** :  <small>*Observe观测数据，对对象进行观测*</small>
&emsp;&emsp;|-- **util**:
&emsp;&emsp;&emsp;&emsp;|-- **index.js** :<small>*工具方法*</small>
&emsp;&emsp;|-- **index.js**: <small>*vue初始化，只是vue的一个声明*</small>
&emsp;&emsp;|-- **init.js** : <small>*在Vue构造函数的原型上添加初始化init方法*</small>
&emsp;&emsp;|-- **state.js**: <small>*初始化状态 ;vue的数据来源：属性(initProps(vm))、方法(initMethods(vm))、数据(initData(vm))、计算属性(initComputed(vm))、watch(initWatch(vm))*</small>

## 疑惑
- 对于数组的劫持为什么不遍历索引添加get set方法？
  - Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。数组的索引也是属性，所以我们是可以监听到数组元素的变化的
  - 但是我们新增一个元素，就不会触发监听事件，因为这个新属性我们并没有监听，删除一个属性也是

> 但是官方的原文：由于 JavaScript 的限制， Vue 不能检测以下变动的数组：
> 当你利用索引直接设置一个项时，例如： vm.items[indexOfItem] = newValue
> 当你修改数组的长度时，例如： vm.items.length = newLength

  - 既然数组是可以被监听的，那为什么vue不能检测'利用索引直接设置一个项'导致的数组元素改变？
  - 说是影响性能： Object.defineProperty()也能监听数组，影响性能是指，比如用索引去修改、添加、删除一个数组的项，是从数组这个数据结构的特点来说，数组会在存中开辟一块连续的空间，所以通过索引修改数组中间的值会导致后面的值都会向前或向后移动吗