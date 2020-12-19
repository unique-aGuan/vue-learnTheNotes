export function patch (oldVnode, vnode) {
  // _c('div',{id:"app",style:{"color":" red"}},_v("你好："),_c('span',undefined,_v("阳光的"+_s(name)+"大人")),_c('div',{id:"age"},_v(_s(age))))
  // 默认初始化的时候，直接用虚拟节点创建出真实节点来，替换掉老的节点
  if (oldVnode.nodeType === 1) {
    // 如果传进来的老节点是一个真实节点，那么就直接更新
    let el = createEle(vnode);
    let parentElm = oldVnode.parentNode;
    parentElm.insertBefore(el, oldVnode.nextsibling); // 当前的真实元素插入到app的后面
    parentElm.removeChild(oldVnode);

    return el;
  } else {
    // 在更新的时候 拿老的虚拟节点 和 新的虚拟节点做对比，将不同的地方更新
    console.log(oldVnode, vnode)
    // 1、比较两个元素的标签，标签不一样直接替换掉就好
    if (oldVnode.tag !== vnode.tag) {
      // 老的dom元素
      return oldVnode.el.parentNode.replaceChild(createEle(vnode), oldVnode.el);
    }
    // 2、有种可能是标签一样 文本节点的虚拟节点也相似(接上一步) 
    // 文本节点的虚拟节点tag 都是undefined
    if (!oldVnode.tag) { //
      if (oldVnode.text !== vnode.text) {
        return oldVnode.el.textContent = vnode.text;
      }
    }
    // 3、标签一样 并且需要开始比对标签的属性 和 儿子了
    // 标签一样直接服用即可
    let el = vnode.el = oldVnode.el; // 复用老节点

    // 更新属性，用新的属性和老的属性做对比，去更新节点
    updateProperties(vnode, oldVnode.data);
  }

}

export function createEle (vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag == 'string') {
    vnode.el = document.createElement(tag);
    updateProperties(vnode);
    children.forEach(child => {
      vnode.el.appendChild(createEle(child));
    });
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el;
}

function updateProperties (vnode, oldProps = {}) {
  let el = vnode.el;
  let newProps = vnode.data || {};
  // 老的有，新的没有 需要删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }
  // 样式处理 老的 style= {color:blud} 新的 style = {background:red}
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  // 老的样式中有 ，新的没
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = '';
    }
  }
  // 新的有，那就直接用新的去做更新即可


  for (let key in newProps) {
    if (key == 'style') {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key == 'class') {
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}