import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";

export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    vm.$el = patch(vm.$el, vnode);
  }
}
export function mountComponent (vm, el) {
  vm.$el = el;
  // 调用render方法去渲染 el属性
  // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
  callHook(vm, 'beforeMount');

  let updateComponent = () => {
    vm._update(vm._render());
  }
  // 这个Watcher是用于渲染的 目前没有任何功能
  let watcher = new Watcher(vm, updateComponent, () => {
    callHook(vm, 'beforeUpdate')
  }, true); // 渲染watcher 只是一个名字
  callHook(vm, 'mounted')
}

export function callHook (vm, hook) {
  const handles = vm.$options[hook];
  if (handles) {
    for (let i = 0; i < handles.length; i++) {
      handles[i].call(vm);
    }
  }
}