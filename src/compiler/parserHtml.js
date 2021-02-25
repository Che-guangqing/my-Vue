// ?:  匹配不捕获

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// console.log(`aaa = '123'`.match(attribute))
const ncname = '[a-zA-Z_][\\w\\-\\.]*'    // abc-aa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`  // <aaa:bfsf>
const startTagOpen = new RegExp(`^<${qnameCapture}`)   // 标签开头的正则 捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/  // 匹配标签结束的 <div />
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)  // </xxx> 标签结尾
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

// ast语法树树根
let root = null;
// 保存当前标签的父级
let currentParent;
// 每次匹配到后入栈，当遇到结束标签查看与上一个是否匹配，匹配两个一起出栈 [div, p, /p] p结束 => [div, /div] => [] div结束, 若最后栈中还有则不符合规范 
let stack = [];
// 标签元素
const ELEMENT_TYPE = 1
// 文本元素
const TEXT_TYPE = 3

// 创建AST树
function createASTElement(tagName,attrs) {
    return {
        tag: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs,
        parent:null
    }
}


function start(tagName, attrs) {
    // console.log('开始标签:',tagName, '属性是:',attrs)
    // 遇到开始标签，就创建一个ast元素
    let element = createASTElement(tagName, attrs)
    if(!root) {
        root = element;
    }
    // 把当前元素标记成父ast树
    currentParent = element
    // 将当前标签存入栈中
    stack.push(element)
}
// 空格字符或者文本
function chars(text) {
    // console.log('文本是:',text)
    // 空
    text = text.replace(/\s/g, '')
    if(text) {
        currentParent.children.push({
            text,
            type:TEXT_TYPE
        })
    }
}
// <div><p>  [div,p]
function end(tagName) {
    // console.log('结尾标签:',tagName)
    // 比较栈中最后一个元素和当前元素是否匹配
    // 得到的是ast对象
    let element = stack.pop();
    // 标识当前这个p是属于这个div的儿子的
    currentParent = stack[stack.length-1]
    if(currentParent) { 
        // 有父级
        element.parent = currentParent;
        currentParent.children.push(element); //实现树的父子关系
    }
}


// 匹配字符串 html => ast树
export function parseHTML(html) {
    // 不停的解析html字符串
    while(html) {
        let textEnd = html.indexOf('<');
        if(textEnd == 0) {
            // 若当前索引为0，肯定是标签，要么开始标签，要么结束标签
            // 通过此方法获取匹配结果，标签名和属性
            let startTagMatch = parseStartTag()
            // 若匹配到开始
            if(startTagMatch) {
                // （1）解析开始标签
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
                // （3）解析结束标签
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
            // （2）解析文本标签
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
    return root
}