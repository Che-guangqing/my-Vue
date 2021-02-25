// ast语法树: 用对象来描述编译原生语法
// 区别于虚拟dom: 用对象来描述dom节点

import {parseHTML} from './parserHtml'
const  defaultTagRE  = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

// 处理属性 
function genProps(attrs) {
    // [{name:'id',value:'app'}, {}]  => {id:app,a:1,b:2}
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if(attr.name === 'style') {
            // style="color: red ; fontSize:14px" => {style: {color:'red'},id:app,}
            let obj = {}
            attr.value.split(";").forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
                // console.log(obj)
            });
            attr.value = obj
        }
        str+= `${attr.name}:${JSON.stringify(attr.value)},`
    }
    // 包装成对象，去掉最后的逗号
    return `{${str.slice(0,-1)}}`
}

// 孩子节点处理 递归！
function genChildren(el) {
    let children = el.children
    if(children && children.length > 0 ) {
        // _c('span),_c('span),_c('span)
        return `${children.map(c => gen(c)).join(',')}`
    }else {
        return false
    }
}
function gen(node) {
    // node: 遍历children拿到的一个个节点对象
    if(node.type == 1) {
        // 元素标签
        return generate(node)
    }else {
        // 文本节点
        let text = node.text
        // a {{name}} b{{age}} c => _v("a" + _s(name) + "b" +_s(age) + c)
        // let reg = /a/g => reg.test('abc') true => reg.test('abc') false => reg.lastIndex = 0 => reg.test('abc') true
        // esec 正则的问题 lastIndex

        
        // 难难难！！！ 没理解
        let tokens = []; //匹配到的{{name}}元素
        let match,index
        // 每次的偏移量
        let lastIndex =  defaultTagRE.lastIndex = 0
        while(match = defaultTagRE.exec(text)) {
            index = match.index
            if(index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex,index)))
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length
        }
        if(lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`
    }

}
 
// 标签
function generate(el) {
    // 生成孩子
    let children = genChildren(el)
    let code = `_c("${el.tag}", ${
        el.attrs.length ? genProps(el.attrs) : 'undefined'
    }${
        children ? `, ${children} ` : ''
    })
    `
    return code
}

export function compileToFunction(template) {
    // console.log(template)
    // <1>、解析html,把html字符串变成ast语法树  (正则匹配HTML标签属性文本 + 循环)
    let root = parseHTML(template)
    // console.log(root)


    let code = generate(root)
    // console.log(code)
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
    let renderFn = new Function(`with(this) {return ${code}}`)
    // 相当于
    // function () {
        // renderFn.call(谁),this就是谁
    //     with(this) {
    //         return _c('div',{id:app}, _c("p",udefined,_v('hello' + _s(name) )),  _v('hello))
    //     }
    // }
    console.log(renderFn)
    return renderFn
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

// 拼接字符串 + with + new Function