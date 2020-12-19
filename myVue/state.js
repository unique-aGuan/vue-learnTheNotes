import { initState } from "./init";
import { compileToFunction } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils/util";
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    let vm = this;

    vm.$options = mergeOptions(vm.constructor.options, options);

    callHook(vm, 'beforeCreate');

    initState(vm);

    callHook(vm, 'created');

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

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
      // console.log(render)
      options.render = render;
    }
    // 挂载当前组件
    mountComponent(vm, el);
  }
}