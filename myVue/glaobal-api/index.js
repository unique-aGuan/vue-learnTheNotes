export function initGlobalApi (Vue) {
  Vue.mixin = function (mixin) {
    console.log(mixin)
  }
}