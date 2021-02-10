// ast语法树: 用对象来描述编译原生语法
// 区别于虚拟dom: 用对象来描述dom节点

import {parseHTML} from './parserHtml'

function generate(el) {
    let code = ``
    
    return code
}

export function compileToFunction(template) {
    // console.log(template)
    // <1>、解析html,把html字符串变成ast语法树  (正则匹配HTML标签属性文本 + 循环)
    let root = parseHTML(template)
    console.log(root)


    let code = generate(root)
    // 将ast语法树生成最终的render函数  就是字符串拼接（模板引擎）
    // render函数返回的是虚拟dom

    // 核心思路：将模板转换成下面字符串
    // <div id="app">
    //     <h1>hello {{name}}</h1>
    //     hello
    // </div>
    // 将ast树再次转换成js语法
    // _c('div',{id:app}, _c("p",udefined,_v('hello' + _s(name) )),  _v('hello))
    return function render() {

    }
}


// 先把html字符串转成AST语法树，再把ast语法树转成render函数

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