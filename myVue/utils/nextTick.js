import Watcher from "../observer/watcher";
import { nextTick } from "./util";

export function stateMixin (Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb)
  }
  Vue.prototype.$watch = function (exproOrFn, handler, options = {}) {
    if (!options.user) {
      options = { ...options, user: true }
    }
    let watcher = new Watcher(this, exproOrFn, handler, options);
    if (options.immediate) {
      handler();
    }
  }
}