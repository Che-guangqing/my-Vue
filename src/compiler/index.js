// ast语法树: 用对象来描述编译原生语法
// 区别于虚拟dom: 用对象来描述dom节点

 import {parseHTML} from './parserHtml'

// <1>、解析html,把html字符串变成ast语法树  (正则匹配HTML标签属性文本 + 循环)
export function compileToFunction(template) {
    // console.log(template)

    let root = parseHTML(template)
    console.log(root)

    // render函数返回的是虚拟dom
    return function render() {

    }
}



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