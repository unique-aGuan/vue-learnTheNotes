import { initState } from "./init";
import { compileToFunction } from "./compiler/index"
import { mountComponent } from "./lifecycle";
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    let vm = this;
    vm.$options = options;
    initState(vm);
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  Vue.prototype.$mount = function (el) {
    // 挂载操作
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    vm.$el = el;
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
}