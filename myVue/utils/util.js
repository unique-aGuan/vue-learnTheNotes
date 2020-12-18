function proxy (vm, data, key) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[data][key];
    },
    set (newValue) {
      vm[data][key] = newValue;
    }
  })
}

function defineProperty (target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false, // 不能被枚举
    configurable: false,
    value: value
  })
}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'update',
  'beforeDestroy',
  'destroyed'
]

const strats = {};
strats.data = function (parentVal, childValue) {
  return childValue; // 这里应该进行对象深度合并
}
// strats.computed = function () { }
// strats.watch = function () { }

function mergeHook (parentVal, childValue) {
  if (childValue) {
    if (parentVal) {
      return parentVal.concat(childValue)
    } else {
      return [childValue];
    }
  } else {
    return parentVal;
  }
}
// 循环
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
})
function mergeOptions (parent, child) {
  // 遍历父亲 ，可能是父亲又 儿子没有
  const options = {};
  // 父亲有 儿子没有 循环出所有
  for (let key in parent) {
    mergeField(key);
  }
  // 儿子有 父亲没有 循环出所有
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key]
    }
    // 如果没有策略，就进行对象合并（小面试题）
  }
  return options;
}
const callbacks = [];

function flushCallbacks () {
  callbacks.forEach(cb => cb());
  pending = false;
}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  }
} else if (MutationObserver) {
  // h5 的API 可以监控dom变化，监控完毕后是异步更新
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode, { characterData: true });
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  setTimeout(flushCallbacks);
}
let pending = false;
function nextTick (cb) { // 因为内部回调用nextTick 用户也会调用 但是异步只需要一次
  callbacks.push(cb);
  if (!pending) {
    timerFunc();
    pending = true;
  }
}

export {
  proxy,
  defineProperty,
  mergeOptions,
  LIFECYCLE_HOOKS,
  nextTick
}