import { compileToFunction } from "./compiler/index"
import { lifecycleMixin, mountComponent } from "./lifecycle";
import { initMixin } from "./state";
import { renderMixin } from "./vdom/index";

let Vue = function (options) {
  this._init(options);
}

initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

Vue.prototype.$mount = function (el) {
  // 挂载操作
  const vm = this;
  const options = vm.$options;
  el = document.querySelector(el);
  if (!options.render) {
    // 如果没render 将template转换成render方法

    let template = options.template;
    if (!template && el) {
      template = el.outerHTML; // DOM知识部分
    }
    // 编译原理 将模板编译成render函数
    const render = compileToFunction(template);
    options.render = render;
  }
  // 挂载当前组件
  mountComponent(vm, el);
}

export default Vue;