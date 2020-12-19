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
    /* 以下是比较第一层node */
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

    /* 以上是比较第一层节点 */
    /* 以下是比较孩子节点 */
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 老的有儿子 新的也有儿子 diff 算法
      updateChildren(oldChildren, newChildren, el);
    } else if (oldChildren.length > 0) { // 儿子节点分为以下几种情况
      // 老的有儿子 新的没儿子
      el.innerHTML = '';
    } else if (newChildren.length > 0) {
      // 老的没儿子 新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createEle(child));
      }
    }

  }

}
// 判断是不是同一个节点
function isSameVnode (oldVnode, newVnode) {
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}
// 儿子间的比较
function updateChildren (oldChildren, newChildren, parent) {
  // vue的diff算法 做了很多优化
  // DOM中操作有很多常见的逻辑 把节点插入到当前儿子的头部、尾部、儿子倒叙正叙
  // vue2中采用双指针的方式
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];
  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];
  // 在尾部添加
  // 我要做一个循环，同时循环老的和新的，哪个先结束，循环就停止，将多余的删除或者添加进去
  // 谁先循环完 停止
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (isSameVnode(oldStartVnode, newStartVnode)) { // 如果俩人是同一个元素，对比儿子
      patch(oldStartVnode, newStartVnode); // 更新属性和style再去递归更新字节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      parent.appendChild(createEle(newChildren[i]));
    }

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