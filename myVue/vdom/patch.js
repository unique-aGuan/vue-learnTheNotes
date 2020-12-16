export function patch (oldVnode, vnode) {
  // _c('div',{id:"app",style:{"color":" red"}},_v("你好："),_c('span',undefined,_v("阳光的"+_s(name)+"大人")),_c('div',{id:"age"},_v(_s(age))))
  let el = createEle(vnode);
  let parentElm = oldVnode.parentNode;
  parentElm.insertBefore(el, oldVnode.nextsibling); // 当前的真实元素插入到app的后面
  parentElm.removeChild(oldVnode);
}

function createEle (vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag == 'string') {
    vnode.el = document.createElement(tag);
    children.forEach(child => {
      vnode.el.appendChild(createEle(child));
    });
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el;
}