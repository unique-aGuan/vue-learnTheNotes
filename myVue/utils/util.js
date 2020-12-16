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

export {
  proxy
}