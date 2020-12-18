import { nextTick } from "../utils/util";
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
    this.isWatcher = options; // 是渲染watcher
    this.id = id++; // watcher 的唯一标识
    this.deps = []; // watcher记录有多少个dep来依赖它
    this.depsId = new Set();

    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn;
    }
    this.get(); // 默认会调用get方法
  }
  addDep (dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  get () {
    pushTarget(this) //当前watcher实例
    this.getter(); // 调用 渲染页面 会取值：render方法with(this)(_v(msg))
    popTarget(this)
  }
  run () {
    this.get()
  }
  update () {
    queueWatcher(this); // 暂存的概念
    // this.get();
  }
}
let queue = []; // 将需要批量更新的watcher 存到一个队列中，稍后让watcher执行
let has = {};
let pending = false;

function flushSchedulerQueue () {
  queue.forEach(watcher => watcher.run());
  queue = [];
  has = {};
  pending = false;
}

function queueWatcher (watcher) {
  const id = watcher.id;
  if (has[id] == null) {
    queue.push(watcher);
    has[id] = true;
    // 等待所有同步代码执行完毕后再执行
    if (!pending) {
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}

export default Watcher;