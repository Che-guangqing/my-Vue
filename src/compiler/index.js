// ast语法树: 用对象来描述编译原生语法
// 区别于虚拟dom: 用对象来描述dom节点
// ?:  匹配不捕获

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// console.log(`aaa = '123'`.match(attribute))
const ncname = '[a-zA-Z_][\\w\\-\\.]*'    // abc-aa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`  // <aaa:bfsf>
const startTagOpen = new RegExp(`^<${qnameCapture}`)   // 标签开头的正则 捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/  // 匹配标签结束的 <div />
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)  // </xxx> 标签结尾
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

function start(tagName, attrs) {
    console.log('开始标签:',tagName, '属性是:',attrs)
}
// 空格字符或者文本
function chars(text) {
    console.log('文本是:',text)
}
function end(tagName) {
    console.log('结尾标签:',tagName)
}

// 匹配字符串 html => ast树
function parseHTML(html) {
    // 不停的解析html字符串
    while(html) {
        let textEnd = html.indexOf('<');
        if(textEnd == 0) {
            // 若当前索引为0，肯定是标签，要么开始标签，要么结束标签
            // 通过此方法获取匹配结果，标签名和属性
            let startTagMatch = parseStartTag()
            // 若匹配到开始
            if(startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                // console.log(startTagMatch)
                // 如果开始标签匹配完毕，继续下一次匹配
                continue
            }

            // 不走上面if，就是结尾标签
            let endTagMatch = html.match(endTag)
            // 若匹配到结尾
            if(endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1])
                continue
            }
        }

        let text;
        if(textEnd >= 0) {
            // 文本
            text = html.substring(0,textEnd)
        }
        if(text) {
            advance(text.length)
            chars(text)
        }
    }

    // <div>jfck</div>
    // 匹配到<div>，就删掉<div>,向后继续截取
    function advance(n) {
        html = html.substring(n)
    }

    // 解析开始标签
    function parseStartTag() {
        let start = html.match(startTagOpen);
        if(start) {
            const match = {
                tagName : start[1],
                attrs: []
            }

            // 匹配到就在原html中删除, 删除标签
            advance(start[0].length)

            // 匹配结束标签
            let end,attr;
            // 匹配不到标签结束 /> 
            while(!(end = html.match(startTagClose)) &&  (attr = html.match(attribute)) ) {
                // 将属性去掉
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }

            // 就是匹配到上一步 去掉开始标签的 >
            if(end) {
                advance(end[0].length)
                return match
            }
            // console.log(html, match)

            // console.log(start)
            // console.log(html)
        }


    }
}

// 把html标签变成ast语法树
export function compileToFunction(template) {
    // console.log(template)

    let root = parseHTML(template)

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