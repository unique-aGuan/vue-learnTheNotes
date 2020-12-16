let oldArrayProtoMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayProtoMethods);

let methods = [
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'reverse',
  'sort'
]

methods.forEach(method => {
  arrayMethods[method] = function () {
    console.log('数组方法被调用了');
    const result = oldArrayProtoMethods[method].apply(this, arguments);
    return result;
  }
})