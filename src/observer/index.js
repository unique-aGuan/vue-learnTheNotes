// 把data中的数据 都使用Object.defineProperty 重新定义 es5
// Object.defineProperty不能兼容ie8 及以下 vue2 无法兼容ie8版本
import { isObject } from '../util/index'
export function observe(data) {
    let isObj = isObject(data);
    if (!isObj) {
        return;
    }
}