import { arrayMethods } from "./data/array";
import Dep from "./observer/dep";
import { defineProperty, proxy } from "./utils/util";
export function initState (vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.watch) {
    console.log(opts)
    initWatch(vm);
  }
}

function initProps (vm) {

}

function initMethods (vm) {

}

function initData (vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === 'function' ? data.call(vm) : data;
  for (let key in data) {
    proxy(vm, '_data', key);
  }
  observe(data);
}

function initWatch (vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // handler 可能是
    if (Array.isArray(handler)) { //  数组
      handler.forEach(handler => {
        createWatcher(vm, key, handler)
      })
    } else {
      createWatcher(vm, key, handler); // 字符串， 对象， 函数
    }
  }
}

function createWatcher (vm, exproOrFn, handler, options) { // options 可以用来标识 是用户
  if (typeof handler == 'object') {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler == 'string') {
    handler = vm[handler];
  }
  return vm.$watch(exproOrFn, handler, options);
}

class Observe {
  constructor(value) {
    this.dep = new Dep();
    // 判断一个对象是否被检测过
    defineProperty(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 我希望调用 push shift unshift splice sort reverse pop
      value.__proto__ = arrayMethods;
      // 观测
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  walk (data) {
    let keys = Object.keys(data);
    keys.forEach(key => {
      defineReactive(data, key, data[key]);
    })
  }
  observeArray (value) {
    value.forEach(item => {
      observe(item);
    })
  }
}

function defineReactive (data, key, value) {
  // 获取到数组对应的dep
  let childDep = observe(value);

  let dep = new Dep(); // 每个属性都有一个dep

  // 当页面取值时，说明这个值用来渲染了，将这个watcher和这个属性对应起来
  Object.defineProperty(data, key, {
    get () {
      // console.log('用户获取值了', value)
      if (Dep.target) {
        dep.depend();
        if (childDep) {
          childDep.dep.depend();
        }
      }
      return value;
    },
    set (newValue) {
      // console.log('用户设置值了');
      if (newValue === value) return;
      observe(newValue);
      value = newValue;
      dep.notify();
    }
  })
}

function observe (data) {
  if (typeof data !== 'object' || data == null) return;
  if (data.__ob__) {
    return;
  }
  return new Observe(data)
}