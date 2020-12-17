import { popTarget, pushTarget } from "./dep";

let id = 0;
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    // vm 实例
    // exprOrFn vm._update(vm._render());
    // cb
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.id = id++; // watcher 的唯一标识

    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn;
    }

    this.get(); // 默认会调用get方法
  }
  get () {
    pushTarget(this) //当前watcher实例
    this.getter(); // 调用 渲染页面 会取值：render方法with(this)(_v(msg))
    popTarget(this)
  }
  update () {
    this.get();
  }
}

export default Watcher;