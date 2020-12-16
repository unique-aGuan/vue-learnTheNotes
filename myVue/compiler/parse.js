const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // aa-aa 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //aa:aa
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 可以匹配到标签名  [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //[0] 标签的结束名字
//    style="xxx"   style='xxx'  style=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;

export function parseHTML (html) {

  function createASTElement (tagName, attrs) {
    return {
      tag: tagName, // 标签名
      type: 1, // 标签类型
      children: [], // 孩子列表
      attrs, // 属性集合
      parent: null // 父元素
    }
  }
  let root;
  let currentParent;
  let stack = [];
  function start (tagName, attrs) {
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element; // 当前解析的标签保存起来
    stack.push(element);
  }

  function end () {
    let element = stack.pop(); // 取出栈中的最后一个
    currentParent = stack[stack.length - 1];
    if (currentParent) { // 在闭合标签是可以知道这个标签的父亲是谁
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  function chars (text) {
    text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        type: 3,
        text
      })
    }
  }

  while (html) { // 只要html不为空，就一直解析
    let textEnd = html.indexOf('<')
    if (textEnd == 0) {
      // 肯定是标签
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]); // 将结束标签传入
        continue;
      }
    }
    let text;
    if (textEnd > 0) { // 是文本
      text = html.substring(0, textEnd);
    }
    if (text) { // 处理文本
      advance(text.length);
      chars(text);
    }
  }

  function advance (n) {
    html = html.substring(n);
  }

  function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length);// 删除开始标签
      // 如果直接是闭合标签了 说明没有属性
      let end;
      let attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length); //去掉当前属性
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }

  return root;
}