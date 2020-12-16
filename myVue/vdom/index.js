export function renderMixin (Vue) { // 用对象来描述dom的结构
  // _c('div',{id:"app",style:{"color":" red"}},_v("你好："),_c('span',undefined,_v("阳光的"+_s(name)+"大人")),_c('div',{id:"age"},_v(_s(age))))
  Vue.prototype._c = function () {
    // 创建元素
    return createElement(...arguments);
  }
  Vue.prototype._v = function (val) {
    // stringify
    return val == null ? '' : (typeof val == 'object') ? JSON.stringify(val) : val;
  }
  Vue.prototype._s = function (text) {
    // 创建文本元素
    console.log(text)
    return createTextVnode(text);
  }
  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    let vnode = render.call(vm);
    console.log(vnode);
    return vnode;
  }
}

function createElement (tag, data = {}, ...children) {
  // console.log(arguments)
  return vnode(tag, data, data.key, children)
}

function createTextVnode (text) {
  return vnode(undefined, undefined, undefined, undefined, text)
}

function vnode (tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text,
  }
}