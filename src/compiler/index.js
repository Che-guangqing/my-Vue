// ast语法树: 用对象来描述编译原生语法
// 区别于虚拟dom: 用对象来描述dom节点
// ?:  匹配不捕获

// 把html标签变成ast语法树
export function compileToFunction(template) {
    
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
    // console.log(`aaa = '123'`.match(attribute))
    const ncname = '[a-zA-Z_][\\w\\-\\.]*'    // abc-aa
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`  // <aaa:bfsf>
    const startTagOpen = new RegExp(`^<${qnameCapture}`)   // 标签开头的正则 捕获的内容是标签名
    const startTagClose = /^\s*(\/?)>/  // 匹配标签结束的 <div />
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)  // </xxx> 标签结尾
    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

    console.log(template)

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