let oldArrayProtoMethods = Array.prototype;
console.log(oldArrayProtoMethods)
export let arrayMethods = Object.create(oldArrayProtoMethods);
console.log(arrayMethods);

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
    oldArrayProtoMethods[method].apply(this, arguments)
  }
})