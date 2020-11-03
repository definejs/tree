const $Object = require('@definejs/object');
const mapper = new Map();

function getNode(key$node, keys) {
    let lastIndex = keys.length - 1;

    for (let index = 0; index <= lastIndex; index++) {
        let key = keys[index];
        let node = key$node[key];

        if (!node || index == lastIndex) { //不存在了，或是最后一项了。
            return node || null;
        }

        key$node = node.key$node; //准备下一轮迭代。
    }
}



function each(key$node, fn) {
    for (let key in key$node) {
        let node = key$node[key];
        let child = node.key$node;
        let isLeaf = !child || $Object.isEmpty(child); //是否为叶子节点。

        let value = fn({
            'key': key,
            'value': node.value,
            'keys': node.keys,
            'isLeaf': isLeaf,
        });

        // 只有在 fn 中明确返回 false 才停止循环。
        if (value === false) {
            break;
        }

        if (!isLeaf) {
            each(child, fn);
        }

    }
}


/**
* 树形结构的存储类。
* 
*/
class Tree {
    /**
    * 构造器。
    * @param {Object} obj 要解析的对象。
    */
    constructor(obj) {
        const meta = {
            'key$node': {},
            'count': 0,         //整棵树的总节点数。
        };

        mapper.set(this, meta);

        //指定了要从 obj 创建现有的。
        if (typeof obj == 'object' && obj) {
            let list = $Object.flat(obj);

            list.forEach((item, index) => { 
                this.set(item.keys, item.value);
            });
        }

    }

    /**
    * 从一个对象中解析并创建对应的树实例。
    * @param {Object} obj 要解析对对象。
    */
    static from(obj) { 
        return new Tree(obj);
    }

    /**
    * 设置指定节点上的值。
    * 如果不存在该节点，则先创建，然后存储值到上面；否则直接改写原来的值为指定的值。
    * 已重载 set(key0, key1, ..., keyN, value) 的情况。
    * 已重载 set([key0, key1, ..., keyN], value) 的情况。
    * @param {Array} keys 节点路径数组。
    * @param value 要设置的值。
    * @example
    *   tree.set(['path', 'to'], 123);
    *   tree.set('path', 'to', 123); //跟上面的等价
    */
    set(keys, value) {
        //重载 set(key0, key1, ..., keyN, value) 的情况。
        if (!Array.isArray(keys)) {
            let args = [...arguments];
            keys = args.slice(0, -1);
            value = args.slice(-1)[0];  //参数中的最后一个即为 value
        }


        let meta = mapper.get(this);
        let key$node = meta.key$node;
        let lastIndex = keys.length - 1;
        let node = null;

        keys.forEach(function (key, index) {
            node = key$node[key];

            //尚未存在该节点，则先创建。
            if (!node) {
                meta.count++;

                node = key$node[key] = {
                    'key$node': {},                     //子节点的容器对象。 如果为空对象，则表示当前节点为叶子节点。
                    'parent': key$node,                 //指向父节点，方便后续处理。
                    'key': key,                         //当前的 key，方便后续处理。
                    'keys': keys.slice(0, index + 1),   //从根节点到当前节点的完整路径，方便后续处理。
                    //'value': undefined,               //会有一个这样的字段，但先不创建。
                };
            }

            if (index < lastIndex) {
                key$node = node.key$node; //准备下一轮迭代
            }
            else { //最后一项
                node.value = value;
            }
        });
    }

    /**
    * 获取指定路径的节点上的值。
    * @return 返回该节点上的值。 如果不存在该节点，则返回 undefined。
    * @example
    *   tree.get('path', 'to'); //获取路径为 'path' -> 'to' 的节点上存储的值。
    *   tree.get(['path', 'to']);//
    */
    get(keys) {
        //重载 get(key0, key1, ..., keyN) 的情况
        if (!(Array.isArray(keys))) {
            keys = [...arguments];
        }

        let meta = mapper.get(this);
        let key$node = meta.key$node;
        let node = getNode(key$node, keys);

        return node ? node.value : undefined;
    }

    /**
    * 判断是否存在指定路径的节点。
    * @param {Array} keys 节点路径数组。
    */
    has(keys) {
        let meta = mapper.get(this);
        let key$node = meta.key$node;
        let node = getNode(key$node, keys);

        return !!node;
    }

    
    /**
    * 对整棵树或指定节点开始的子树中的所有节点进行迭代执行一个回调函数。
    * 已重载 each(fn); //对整棵树进行迭代。
    * 已重载 each(keys, fn); //对指定的节点开始的子树进行迭代。
    * 已重载 each(key0, key1, ..., keyN, fn); //对指定的节点开始的子树进行迭代。
    * @param {Array} keys 节点路径数组。
    * @param {function} fn 迭代时要执行的回调函数。
    *   在回调函数中明确返回 false 会中止迭代。
    * 
    */
    each(keys, fn) {
        //重载 each(fn);  
        //对整棵树进行迭代。
        if (typeof keys == 'function') {
            fn = keys;
            keys = [];
        }
        //重载 each(key0, key1, ..., keyN, fn); 
        //对指定的节点开始的子树进行迭代。
        else if (!Array.isArray(keys)) { 
            let args = [...arguments];
            keys = args.slice(0, -1);   //前面 n-1 项都为 key。
            fn = args.slice(-1)[0];     //参数中的最后一个即为 fn。
        }

        if (typeof fn != 'function') {
            throw new Error(`参数 fn 必须为一个函数。`);
        }


        let meta = mapper.get(this);
        let key$node = meta.key$node; //默认是从整棵树的根节点开始。

        //指定了要从某个节点开始。
        if (keys.length > 0) {
            let node = getNode(key$node, keys);

            if (!node) {
                throw new Error(`不存在路径为 ${keys.join('.')} 的节点。`);
            }

            key$node = node.key$node;
        }

        each(key$node, fn);
    }

    /**
    * 清空全部节点及数据。
    */
    clear() {
        let meta = mapper.get(this);
        meta.key$node = {};
        meta.count = 0;
    }

    /**
    * 删除指定节点上的值。
    */
    remove(keys) {
        //重载 remove(key0, key1, ..., keyN) 的情况
        if (!(Array.isArray(keys))) {
            keys = [].slice.call(arguments);
        }

        let meta = mapper.get(this);
        let key$node = meta.key$node;
        let node = getNode(key$node, keys);

        if (!node) { //不存在该节点
            return;
        }


        let obj = node.key$node;                //子节点

        if (!obj || $Object.isEmpty(obj)) {    //不存在子节点
            meta.count--;
            delete node.parent[node.key];       //删除整个节点自身，节省内存
        }
        else {
            delete node.value; //仅删除值，子节点不受影响。
        }
    }

    /**
    * 销毁。
    */
    destroy() {
        mapper.delete(this);
    }
}

module.exports = Tree;
