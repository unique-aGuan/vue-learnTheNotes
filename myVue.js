let Vue = function (options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  let vm = this;
  vm.$options = options;
  initState(vm);
}

const initState = function initState () {

}

let vm = new Vue({
  el: 'app',
  data () {
    return { a: 1 }
  }
});
console.log(vm.$options)