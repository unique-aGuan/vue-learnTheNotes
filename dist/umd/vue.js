(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[data][key];
      },
      set: function set(newValue) {
        vm[data][key] = newValue;
      }
    });
  }

  function defineProperty(target, key, value) {
    Object.defineProperty(target, key, {
      enumerable: false,
      // 不能被枚举
      configurable: false,
      value: value
    });
  }

  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'update', 'beforeDestroy', 'destroyed'];
  var strats = {};

  strats.data = function (parentVal, childValue) {
    return childValue; // 这里应该进行对象深度合并
  }; // strats.computed = function () { }
  // strats.watch = function () { }


  function mergeHook(parentVal, childValue) {
    if (childValue) {
      if (parentVal) {
        return parentVal.concat(childValue);
      } else {
        return [childValue];
      }
    } else {
      return parentVal;
    }
  } // 循环


  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  function mergeOptions(parent, child) {
    // 遍历父亲 ，可能是父亲又 儿子没有
    var options = {}; // 父亲有 儿子没有 循环出所有

    for (var key in parent) {
      mergeField(key);
    } // 儿子有 父亲没有 循环出所有


    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key];
      } // 如果没有策略，就进行对象合并（小面试题）

    }

    return options;
  }

  var callbacks = [];

  function flushCallbacks() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    pending = false;
  }

  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    // h5 的API 可以监控dom变化，监控完毕后是异步更新
    var observe = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observe.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    setTimeout(flushCallbacks);
  }

  var pending = false;

  function nextTick(cb) {
    // 因为内部回调用nextTick 用户也会调用 但是异步只需要一次
    callbacks.push(cb);

    if (!pending) {
      timerFunc();
      pending = true;
    }
  }

  function initGlobalApi(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 合并对象 （我先考虑生命周期）不考虑其他合并 data computed watch
      this.options = mergeOptions(this.options, mixin);
    };
  } // 用户new vue 合并

  function patch(oldVnode, vnode) {
    // _c('div',{id:"app",style:{"color":" red"}},_v("你好："),_c('span',undefined,_v("阳光的"+_s(name)+"大人")),_c('div',{id:"age"},_v(_s(age))))
    // 默认初始化的时候，直接用虚拟节点创建出真实节点来，替换掉老的节点
    if (oldVnode.nodeType === 1) {
      // 如果传进来的老节点是一个真实节点，那么就直接更新
      var el = createEle(vnode);
      var parentElm = oldVnode.parentNode;
      parentElm.insertBefore(el, oldVnode.nextsibling); // 当前的真实元素插入到app的后面

      parentElm.removeChild(oldVnode);
      return el;
    } else {
      // 在更新的时候 拿老的虚拟节点 和 新的虚拟节点做对比，将不同的地方更新

      /* 以下是比较第一层node */
      // 1、比较两个元素的标签，标签不一样直接替换掉就好
      if (oldVnode.tag !== vnode.tag) {
        // 老的dom元素
        return oldVnode.el.parentNode.replaceChild(createEle(vnode), oldVnode.el);
      } // 2、有种可能是标签一样 文本节点的虚拟节点也相似(接上一步) 
      // 文本节点的虚拟节点tag 都是undefined


      if (!oldVnode.tag) {
        //
        if (oldVnode.text !== vnode.text) {
          return oldVnode.el.textContent = vnode.text;
        }
      } // 3、标签一样 并且需要开始比对标签的属性 和 儿子了
      // 标签一样直接服用即可


      var _el = vnode.el = oldVnode.el; // 复用老节点
      // 更新属性，用新的属性和老的属性做对比，去更新节点


      updateProperties(vnode, oldVnode.data);
      /* 以上是比较第一层节点 */

      /* 以下是比较孩子节点 */

      var oldChildren = oldVnode.children || [];
      var newChildren = vnode.children || [];

      if (oldChildren.length > 0 && newChildren.length > 0) {
        // 老的有儿子 新的也有儿子 diff 算法
        updateChildren(oldChildren, newChildren, _el);
      } else if (oldChildren.length > 0) {
        // 儿子节点分为以下几种情况
        // 老的有儿子 新的没儿子
        _el.innerHTML = '';
      } else if (newChildren.length > 0) {
        // 老的没儿子 新的有儿子
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i];

          _el.appendChild(createEle(child));
        }
      }
    }
  } // 判断是不是同一个节点

  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
  } // 儿子间的比较


  function updateChildren(oldChildren, newChildren, parent) {
    // vue的diff算法 做了很多优化
    // DOM中操作有很多常见的逻辑 把节点插入到当前儿子的头部、尾部、儿子倒叙正叙
    // vue2中采用双指针的方式
    var oldStartIndex = 0;
    var oldStartVnode = oldChildren[0];
    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0;
    var newStartVnode = newChildren[0];
    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex]; // 在尾部添加
    // 我要做一个循环，同时循环老的和新的，哪个先结束，循环就停止，将多余的删除或者添加进去
    // 谁先循环完 停止

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (item, index) {
        map[item.key] = index; // 建立映射表，存储key值所在的位置
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 如果俩人（开头）是同一个元素，递归深入后，自增
        patch(oldStartVnode, newStartVnode); // 更新属性和style再去递归更新字节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 如果俩人（结尾）是同一个元素，递归深入后，自增
        patch(oldEndVnode, newEndVnode); // 更新属性和style再去递归更新字节点

        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patch(oldStartVnode, newEndVnode);
        parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextsibling);
        newEndVnode = newChildren[--newEndIndex];
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patch(oldEndVnode, newStartVnode);
        parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
        newStartVnode = newChildren[++newStartIndex];
        oldEndVnode = oldChildren[--oldEndIndex];
      } else {
        // 儿子之间没有关系 ..... 暴力对比
        var moveIndex = map[newStartVnode.key]; // 拿到开头的虚拟节点的key 去老的中找
        // 可能moveIndex根本不存在

        if (moveIndex == undefined) {
          parent.insertBefore(createEle(newStartVnode), oldStartVnode.el);
        } else {
          var moveVNode = oldChildren[moveIndex];
          oldChildren[moveIndex] = null;
          parent.insertBefore(moveVNode, oldStartVnode.el);
          patch(moveVNode, newStartVnode); // 比较属性和儿子
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    }

    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
        parent.insertBefore(createEle(newChildren[i]), ele);
      }
    } // 老的节点还没有处理的，说明这些老节点是不需要的节点，如果这里面有null说明，这个节点已经被处理过了，跳过即可


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldChildren[_i];

        if (child != null) {
          parent.removeChild(child.el);
        }
      }
    }
  }

  function createEle(vnode) {
    var tag = vnode.tag,
        children = vnode.children,
        key = vnode.key,
        data = vnode.data,
        text = vnode.text;

    if (typeof tag == 'string') {
      vnode.el = document.createElement(tag);
      updateProperties(vnode);
      children.forEach(function (child) {
        vnode.el.appendChild(createEle(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var el = vnode.el;
    var newProps = vnode.data || {}; // 老的有，新的没有 需要删除属性

    for (var key in oldProps) {
      if (!newProps[key]) {
        el.removeAttribute(key);
      }
    } // 样式处理 老的 style= {color:blud} 新的 style = {background:red}


    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {}; // 老的样式中有 ，新的没

    for (var _key in oldStyle) {
      if (!newStyle[_key]) {
        el.style[_key] = '';
      }
    } // 新的有，那就直接用新的去做更新即可


    for (var _key2 in newProps) {
      if (_key2 == 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (_key2 == 'class') {
        el.className = newProps["class"];
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  }

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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var id = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.subs = [];
      this.id = id++;
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 我们希望 watcher 可以存放dep
        // this.subs.push(Dep.target) // 存进去了一个watcher
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher; // 保留watcher
  }
  function popTarget() {
    Dep.target = null; //  将变量删除
  }
  // dep 可以存多个watcher vm.$watch('name')
  // 一个watcher可以对应多个dep

  var id$1 = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      // vm 实例
      // exprOrFn vm._update(vm._render());
      // cb
      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.user = options.user; // 这个一个用户watcher

      this.isWatcher = typeof options === 'boolean' ? options : false;

      this.id = id$1++; // watcher 的唯一标识

      this.deps = []; // watcher记录有多少个dep来依赖它

      this.depsId = new Set();

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn;
      } else {
        this.getter = function () {
          //exprOrFn 可能是字符串a
          // 去当前实例上去取值是才会触发依赖收集
          var path = exprOrFn.split('.'); // ['a'.'a'.'a']

          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj;
        };
      }

      this.value = this.get(); // 默认会调用get方法
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); //当前watcher实例

        var result = this.getter(); // 调用 渲染页面 会取值：render方法with(this)(_v(msg))

        popTarget();
        return result;
      }
    }, {
      key: "run",
      value: function run() {
        var newValue = this.get();
        var oldValue = this.value;
        this.value = newValue;

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "update",
      value: function update() {
        queueWatcher(this); // 暂存的概念
        // this.get();
      }
    }]);

    return Watcher;
  }();

  var queue = []; // 将需要批量更新的watcher 存到一个队列中，稍后让watcher执行

  var has = {};
  var pending$1 = false;

  function flushSchedulerQueue() {
    queue.forEach(function (watcher) {
      watcher.run();

      if (!watcher.user) {
        watcher.cb();
      }
    });
    queue = [];
    has = {};
    pending$1 = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true; // 等待所有同步代码执行完毕后再执行

      if (!pending$1) {
        nextTick(flushSchedulerQueue);
        pending$1 = true;
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 这里需要区分以下 到底是首次渲染还是更新

      var prevVnode = vm._vnode;

      if (!prevVnode) {
        // 用新的创建的元素，替换老的vm.$el
        vm.$el = patch(vm.$el, vnode);
      } else {
        vm.$el = patch(prevVnode, vnode);
      }

      vm._vnode = vnode;
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; // 调用render方法去渲染 el属性
    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上

    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    }; // 这个Watcher是用于渲染的 目前没有任何功能


    var watcher = new Watcher(vm, updateComponent, function () {
      callHook(vm, 'beforeUpdate');
    }, true); // 渲染watcher 只是一个名字

    callHook(vm, 'mounted');
  }
  function callHook(vm, hook) {
    var handles = vm.$options[hook];

    if (handles) {
      for (var i = 0; i < handles.length; i++) {
        handles[i].call(vm);
      }
    }
  }

  var oldArrayProtoMethods = Array.prototype;
  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', 'unshift', 'shift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProtoMethods[method].apply(this, arguments);
      var inserted;
      var ob = this.__ob__;

      switch (methods) {
        case 'push':
          break;

        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted);
      ob.dep.notify();
      return result;
    };
  });

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data;
    vm._data = data = typeof data === 'function' ? data.call(vm) : data;

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe$1(data);
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    var _loop = function _loop(key) {
      var handler = watch[key]; // handler 可能是

      if (Array.isArray(handler)) {
        //  数组
        handler.forEach(function (handler) {
          createWatcher(vm, key, handler);
        });
      } else {
        createWatcher(vm, key, handler); // 字符串， 对象， 函数
      }
    };

    for (var key in watch) {
      _loop(key);
    }
  }

  function createWatcher(vm, exproOrFn, handler, options) {
    // options 可以用来标识 是用户
    if (_typeof(handler) == 'object') {
      options = handler;
      handler = handler.handler;
    }

    if (typeof handler == 'string') {
      handler = vm[handler];
    }

    return vm.$watch(exproOrFn, handler, options);
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(value) {
      _classCallCheck(this, Observe);

      this.dep = new Dep(); // 判断一个对象是否被检测过

      defineProperty(value, '__ob__', this);

      if (Array.isArray(value)) {
        // 我希望调用 push shift unshift splice sort reverse pop
        value.__proto__ = arrayMethods; // 观测

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (item) {
          observe$1(item);
        });
      }
    }]);

    return Observe;
  }();

  function defineReactive(data, key, value) {
    // 获取到数组对应的dep
    var childDep = observe$1(value);
    var dep = new Dep(); // 每个属性都有一个dep
    // 当页面取值时，说明这个值用来渲染了，将这个watcher和这个属性对应起来

    Object.defineProperty(data, key, {
      get: function get() {
        // console.log('用户获取值了', value)
        if (Dep.target) {
          dep.depend();

          if (childDep) {
            childDep.dep.depend();
          }
        }

        return value;
      },
      set: function set(newValue) {
        // console.log('用户设置值了');
        if (newValue === value) return;
        observe$1(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }

  function observe$1(data) {
    if (_typeof(data) !== 'object' || data == null) return;

    if (data.__ob__) {
      return;
    }

    return new Observe(data);
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type == 1) {
      return generate(node); // 生成元素节点字符串
    } else {
      var text = node.text; // 如果是普通文本，不带{{}}

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      }

      var tokens = []; // 存放每一段代码

      var lastIndex = defaultTagRE.lastIndex = 0; // 如果正则式全局模式，需要每次使用前重置为零

      var match, index; // 每次匹配到的结果

      while (match = defaultTagRE.exec(text)) {
        index = match.index; // 保存匹配到的索引

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function genChildren(children) {
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function generate(ast) {
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length ? genProps(ast.attrs) : 'undefined', ",").concat(ast.children ? genChildren(ast.children) : '', ")");
    return code;
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //aa:aa

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名  [1]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //[0] 标签的结束名字
  //    style="xxx"   style='xxx'  style=xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/;
  function parseHTML(html) {
    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        // 标签名
        type: 1,
        // 标签类型
        children: [],
        // 孩子列表
        attrs: attrs,
        // 属性集合
        parent: null // 父元素

      };
    }

    var root;
    var currentParent;
    var stack = [];

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element; // 当前解析的标签保存起来

      stack.push(element);
    }

    function end() {
      var element = stack.pop(); // 取出栈中的最后一个

      currentParent = stack[stack.length - 1];

      if (currentParent) {
        // 在闭合标签是可以知道这个标签的父亲是谁
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    while (html) {
      // 只要html不为空，就一直解析
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        // 肯定是标签
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 将结束标签传入

          continue;
        }
      }

      var text = void 0;

      if (textEnd > 0) {
        // 是文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        // 处理文本
        advance(text.length);
        chars(text);
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 删除开始标签
        // 如果直接是闭合标签了 说明没有属性

        var _end;

        var attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); //去掉当前属性
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  function compileToFunction(template) {
    // html模板 -> render函数
    // 1、需要将html代码转化成“ast”语法树 可以用ast书来描述语言本身
    // 前端必须掌握的数据结构 （树）
    var ast = parseHTML(template); // 2、 优化静态节点
    // ...
    // 3、通过这颗树 重新生成代码

    var code = generate(ast); // 4、将字符串变成函数

    var render = new Function("with(this){return ".concat(code, "};"));
    return render;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(vm.constructor.options, options);
      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created');

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 挂载操作
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);

      if (!options.render) {
        // 如果没render 将template转换成render方法
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML; // DOM知识部分
        } // 编译原理 将模板编译成render函数


        var render = compileToFunction(template); // console.log(render)

        options.render = render;
      } // 挂载当前组件


      mountComponent(vm, el);
    };
  }

  function stateMixin(Vue) {
    Vue.prototype.$nextTick = function (cb) {
      nextTick(cb);
    };

    Vue.prototype.$watch = function (exproOrFn, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!options.user) {
        options = _objectSpread2(_objectSpread2({}, options), {}, {
          user: true
        });
      }

      var watcher = new Watcher(this, exproOrFn, handler, options);

      if (options.immediate) {
        handler();
      }
    };
  }

  function renderMixin(Vue) {
    // 用对象来描述dom的结构
    // _c('div',{id:"app",style:{"color":" red"}},_v("你好："),_c('span',undefined,_v("阳光的"+_s(name)+"大人")),_c('div',{id:"age"},_v(_s(age))))
    Vue.prototype._c = function () {
      // 创建元素
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._v = function (text) {
      // stringify
      return createTextVnode(text);
    };

    Vue.prototype._s = function (val) {
      // 创建文本元素
      return val == null ? '' : _typeof(val) == 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  }

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, data, data.key, children);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  var Vue = function Vue(options) {
    this._init(options);
  }; // 原型方法


  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);
  stateMixin(Vue); // 静态方法 Vue.component Vue.directive Vue.extend Vue.mixin

  initGlobalApi(Vue); // 为了看到diff的整个流程 创建两个虚拟节点进行对比操作
  var vm1 = new Vue({
    data: {
      name: 'ag'
    }
  });
  var render1 = compileToFunction("<div id=\"a\">\n<li style=\"background:red\" key=\"a\">A</li>\n<li style=\"background:yellow\" key=\"b\">B</li>\n<li style=\"background:pink\" key=\"c\">C</li>\n<li style=\"background:greenyellow\" key=\"d\">D</li>\n</div>");
  var vnode1 = render1.call(vm1); // render方法返回的就是一个虚拟dom

  document.body.appendChild(createEle(vnode1));
  var vm2 = new Vue({
    data: {
      name: 'ga'
    }
  });
  var render2 = compileToFunction("<div id=\"a\">\n<li style=\"background:gray\" key=\"s\">S</li>\n<li key=\"i\">i</li>\n<li style=\"background:greenyellow\" key=\"d\">D</li>\n<li style=\"background:pink\" key=\"c\">C</li>\n<li style=\"background:blue\" key=\"p\">P</li>\n<li style=\"background:yellow\" key=\"b\">B</li>\n<li style=\"background:red\" key=\"a\">A</li>\n</div>");
  var vnode2 = render2.call(vm2); // render方法返回的就是一个虚拟dom
  // document.body.appendChild(createEle(vnode2));
  // 传入一个新的节点和老的做对比

  setTimeout(function () {
    patch(vnode1, vnode2);
  }, 1000);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
