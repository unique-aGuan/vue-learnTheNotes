let id = 0;
class Dep {
  constructor() {
    this.subs = [];
    this.id = id++;
  }
  depend () {
    // 我们希望 watcher 可以存放dep
    // this.subs.push(Dep.target) // 存进去了一个watcher
    Dep.target.addDep(this);
  }
  addSub (watcher) {
    this.subs.push(watcher)
  }
  notify () {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null;
let stack = [];
export function pushTarget (watcher) {
  Dep.target = watcher; // 保留watcher
  stack.push(watcher); // 有渲染watcher 有计算属性watcher
}

export function popTarget () {
  stack.pop();
  Dep.target = stack[stack.length - 1]; //  将变量删除
}

export default Dep;
// 多对多的关系 一个属性有一个dep是用来收集watcher的
// dep 可以存多个watcher vm.$watch('name')
// 一个watcher可以对应多个dep