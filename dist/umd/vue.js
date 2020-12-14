(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function isObject() {
    if ((typeof data === "undefined" ? "undefined" : _typeof(data)) !== 'object' && data !== null) {
      return;
    }
  }

  // 把data中的数据 都使用Object.defineProperty 重新定义 es5
  function observe(data) {
    var isObj = isObject();

    if (!isObj) {
      return;
    }
  }

  function initState(vm) {
    var opts = vm.$options; // vue 的数据来源 属性 方法 数据 计算属性 watch

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // 数据初始化工作
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 劫持对象 用户改变了数据 我希望可以得到通知 -> 刷新页面
    // MVVM模式 数据变化可以驱动视图变化
    // Object.defineProperty () 给属性增加get方法和set方法

    observe(); // 响应式原理
  }

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // 数据劫持
      var vm = this; // 在vue中使用 this.$options 指代的就是用户传递的属性

      vm.$options = options; // 初始化状态

      initState(vm); // 分割代码
    };
  }

  // vue的核心代码 只是vue的一个声明

  function Vue(options) {
    // 进行vue的初始化操作
    this._init(options);
  } // 通过引入文件的方式给vue原型上添加方法


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
