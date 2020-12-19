import { initGlobalApi } from "./glaobal-api/index";
import { lifecycleMixin } from "./lifecycle";
import { initMixin } from "./state";
import { stateMixin } from "./utils/nextTick";
import { renderMixin } from "./vdom/index";

let Vue = function (options) {
  this._init(options);
}

// 原型方法
initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
stateMixin(Vue);

// 静态方法 Vue.component Vue.directive Vue.extend Vue.mixin
initGlobalApi(Vue);

// 为了看到diff的整个流程 创建两个虚拟节点进行对比操作
import { compileToFunction } from "./compiler/index";
import { createEle, patch } from "./vdom/patch";
let vm1 = new Vue({ data: { name: 'ag' } });
let render1 = compileToFunction(`<div id="a">
<li style="background:red" key="a">A</li>
<li style="background:yellow" key="b">B</li>
<li style="background:pink" key="c">C</li>
<li style="background:greenyellow" key="d">D</li>
</div>`);
let vnode1 = render1.call(vm1); // render方法返回的就是一个虚拟dom

document.body.appendChild(createEle(vnode1));
let vm2 = new Vue({ data: { name: 'ga' } })
let render2 = compileToFunction(`<div id="a">
<li style="background:gray" key="s">S</li>
<li key="i">i</li>
<li style="background:greenyellow" key="d">D</li>
<li style="background:pink" key="c">C</li>
<li style="background:blue" key="p">P</li>
<li style="background:yellow" key="b">B</li>
<li style="background:red" key="a">A</li>
</div>`);
let vnode2 = render2.call(vm2); // render方法返回的就是一个虚拟dom

// document.body.appendChild(createEle(vnode2));

// 传入一个新的节点和老的做对比
setTimeout(() => {
  patch(vnode1, vnode2)
}, 1000)
export default Vue;