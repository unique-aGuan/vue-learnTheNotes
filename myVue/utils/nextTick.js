import { nextTick } from "./util";

export function stateMixin (Vue) {
  Vue.prototype.$nextTick = function (cb) {
    let vm = this;
    nextTick(cb)
  }
}