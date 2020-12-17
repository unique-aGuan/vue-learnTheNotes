import { initGlobalApi } from "./glaobal-api/index";
import { lifecycleMixin } from "./lifecycle";
import { initMixin } from "./state";
import { renderMixin } from "./vdom/index";

let Vue = function (options) {
  this._init(options);
}
// 原型方法
initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
// 静态方法 Vue.component Vue.directive Vue.extend Vue.mixin
initGlobalApi(Vue);
export default Vue;