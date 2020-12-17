import { mergeOptions } from '../utils/util'

export function initGlobalApi (Vue) {
  Vue.options = {};
  Vue.mixin = function (mixin) {
    // 合并对象 （我先考虑生命周期）不考虑其他合并 data computed watch
    this.options = mergeOptions(this.options, mixin);
    console.log(this.options);
  }
}
// 用户new vue 合并