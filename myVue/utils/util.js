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

export const LIFECYCLE_HOOKS = [
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
strats.data = function () { }
strats.computed = function () { }
strats.watch = function () { }

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
  console.log(parent, child)
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
    }
    // 如果没有策略，就进行对象合并（小面试题）
  }
  return options;
}

export {
  proxy,
  defineProperty,
  mergeOptions
}