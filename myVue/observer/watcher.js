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
    this.user = options.user; // 这个一个用户watcher
    this.lazy = options.lazy; // 如果属性上有lazy属性，说明是一个计算属性
    this.dirty = this.lazy; // 她默认等于lazy 但是lazy是不可变的 dirty是可变的 她代表的是取值时是否执行用户执行的方法
    this.isWatcher = typeof options === 'boolean' ? options : false;; // 是渲染watcher
    this.id = id++; // watcher 的唯一标识
    this.deps = []; // watcher记录有多少个dep来依赖它
    this.depsId = new Set();

    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn;
    } else {
      this.getter = function () {
        // exprOrFn 可能是字符串a
        // 去当前实例上去取值是才会触发依赖收集
        let path = exprOrFn.split('.'); // ['a'.'a'.'a']
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj;
      }
    }
    this.value = this.lazy ? void 0 : this.get(); // 默认会调用get方法 如果时计算属性，默认不执行
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
    let result = this.getter.call(this.vm); // 调用 渲染页面 会取值：render方法with(this)(_v(msg))
    popTarget(this);

    return result;
  }
  run () {
    let newValue = this.get();
    let oldValue = this.value;
    this.value = newValue;
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue)
    }
  }
  update () {
    if (this.lazy) { // 是计算属性
      this.dirty = true; // 值更新了，页面重新渲染就可以获得最新的值了
    } else {
      queueWatcher(this); // 暂存的概念
      // this.get();
    }
  }
  evaluate () {
    this.value = this.get();
    this.dirty = false; // 去过一次值之后 就表示已经取过值了
  }
  depend () {
    // 计算属性watcher 会存储 dep  dep会存储watcher
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend;// 让dep取存储渲染watcher
    }

  }
}
let queue = []; // 将需要批量更新的watcher 存到一个队列中，稍后让watcher执行
let has = {};
let pending = false;

function flushSchedulerQueue () {
  queue.forEach(watcher => {
    watcher.run();
    if (!watcher.user) {
      watcher.cb();
    }
  });
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