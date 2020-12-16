import { generate } from "./generate";
import { parseHTML } from "./parse";

export function compileToFunction (template) {
  // html模板 -> render函数
  // 1、需要将html代码转化成“ast”语法树 可以用ast书来描述语言本身

  // 前端必须掌握的数据结构 （树）
  let ast = parseHTML(template);
  // 2、 优化静态节点
  // ...

  // 3、通过这颗树 重新生成代码
  let code = generate(ast);
  // 4、将字符串变成函数
  let render = new Function(`with(this){${code}};`);
  return render;
}