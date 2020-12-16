const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function genProps (attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      let obj = {};
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':');
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function gen (node) {
  if (node.type == 1) {
    return generate(node); // 生成元素节点字符串
  } else {
    let text = node.text;
    // 如果是普通文本，不带{{}}
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }
    let tokens = []; // 存放每一段代码
    let lastIndex = defaultTagRE.lastIndex = 0; // 如果正则式全局模式，需要每次使用前重置为零
    let match, index; // 每次匹配到的结果
    while (match = defaultTagRE.exec(text)) {
      index = match.index; // 保存匹配到的索引
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return `_v(${tokens.join('+')})`;
  }
}

function genChildren (children) {
  if (children) {
    return children.map(child => gen(child)).join(',');
  }
}
export function generate (ast) {
  let code = `_c('${ast.tag}',${ast.attrs.length ? genProps(ast.attrs) : 'undefined'},${ast.children ? genChildren(ast.children) : ''})`;
  return code;
}