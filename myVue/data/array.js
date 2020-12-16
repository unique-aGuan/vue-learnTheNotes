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
  arrayMethods[method] = function (...args) {
    const result = oldArrayProtoMethods[method].apply(this, arguments);
    let inserted;
    let ob = this.__ob__;
    switch (methods) {
      case 'push':
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
      default:
        break;
    }
    if (inserted) ob.observeArray(inserted);
    return result;
  }
})