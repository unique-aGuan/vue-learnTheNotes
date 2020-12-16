import { arrayMethods } from "./data/array";
import { defineProperty, proxy } from "./utils/util";

let Vue = function (options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  let vm = this;
  vm.$options = options;
  initState(vm);
}

const initState = function initState (vm) {
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

class Observe {
  constructor(value) {
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
  observe(value);
  Object.defineProperty(data, key, {
    get () {
      console.log('用户获取值了')
      return value;
    },
    set (newValue) {
      console.log('用户设置值了');
      if (newValue === value) return;
      observe(newValue);
      value = newValue;
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

export default Vue;