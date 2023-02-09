
const Node = require('./Tree/Node');

const mapper = new Map();
let idCounter = 0;

/**
* 树形结构的存储类。
* 
*/
class Tree {
    /**
    * 构造器。
    * @param {Array} [list] 可选，要解析的类文件路径列表。
    * @param {string} [seperator] 可选，类文件路径里的分隔符，如 `/`。
    */
    constructor(list, seperator) {
        let id = `definejs-Tree-${idCounter++}`;
        let root = Node.create();

        let meta = {
            'id': id,
            'root': root,
            'this': this,
        };

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
        });

        if (Array.isArray(list)) {
            seperator = seperator || '/';

            list.forEach((item) => {
                let keys = item.split(seperator);
                meta.this.set(keys);
            });
        }

    }

    // /**
    // * 当前实例的 id。
    // */
    // id = ''


    /**
    * 渲染树为文本形式的图形结构。
    * @param {Array} 
    */
    render(keys, fn) {
        //重载 render(fn);
        if (typeof keys == 'function') {
            fn = keys;
            keys = null;
        }

        keys = keys || [];

        let id$info = {};
        let lines = [];
        let TAB = Array(4 + 1).join(` `);

        this.each(keys, function (node) {
            let { id, x, y, key, siblings, parent, } = node;
            let hasNextSibling = x < siblings.length - 1;       //
            let linker = hasNextSibling ? `├──` : `└──`;        //
            let content = `${linker} ${key}`;                   //如 `├── Main`
            let tabs = y > 1 ? Array(y).join(TAB) : ``;         //缩进量。 根据当前节点所处的层级决定。


            if (parent && !parent.isRoot) {
                let p = id$info[parent.id];
                if (p) {
                    let c = p.hasNextSibling ? `│` : ` `;
                    tabs = p.tabs + c + TAB.slice(1);
                }
            }


            let info = id$info[id] = {
                hasNextSibling,
                tabs,
                content,
            };

            let value = `${tabs}${content}`;

            if (fn) {
                value = fn(node, {
                    ...info,
                    linker,
                });

                //回调函数中明确返回了 false，则表示要中止迭代。
                if (value === false) {
                    return false;
                }
            }

            lines.push(value);

        });

        return lines;
    }


    /**
    * 设置指定节点上的值。
    * 如果不存在该节点，则先创建，然后存储值到上面；否则直接改写原来的值为指定的值。
    * @param {Array} keys 节点路径数组。
    * @param value 要设置的值。
    * @example
    *   tree.set(['path', 'to'], 123);
    */
    set(keys, value) {
        let meta = mapper.get(this);
        Node.set(meta.root, keys, value);

    }

    /**
    * 获取指定路径的节点上的值。
    * @return 返回该节点上的值。 如果不存在该节点，则返回 undefined。
    * @example
    *   tree.get(['path', 'to']); //获取路径为 'path' -> 'to' 的节点上存储的值。
    */
    get(keys) {
        let meta = mapper.get(this);
        let node = Node.get(meta.root, keys);

        return node ? node.value : undefined;
    }

    /**
    * 判断是否存在指定路径的节点。
    * @param {Array} keys 节点路径数组。
    */
    has(keys) {
        let meta = mapper.get(this);
        let node = Node.get(meta.root, keys);

        return !!node;
    }


    /**
    * 对整棵树或指定节点开始的子树中的所有节点进行迭代执行一个回调函数。
    * 已重载 each(fn); //对整棵树进行迭代。
    * 已重载 each(keys, fn); //对指定的节点开始的子树进行迭代。
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


        if (typeof fn != 'function') {
            throw new Error(`参数 fn 必须为一个函数。`);
        }


        let meta = mapper.get(this);
        let root = meta.root;
        let node = keys.length > 0 ? Node.get(root, keys) : root;

        if (!node) {
            throw new Error(`不存在路径为 ${keys.join('.')} 的节点。`);
        }

        Node.each(node, fn);
    }

    /**
    * 清空全部节点及数据。
    */
    clear() {
        let meta = mapper.get(this);

        meta.root = Node.create([], null);
    }

    /**
    * 删除指定节点上的值。
    */
    remove(keys) {
        let meta = mapper.get(this);
        let node = Node.get(meta.root, keys);

        if (!node) { //不存在该节点
            return;
        }

        delete node.value; //仅删除值，子节点不受影响。
    }

    /**
    * 销毁。
    */
    destroy() {
        mapper.delete(this);
    }

    
}

module.exports = Tree;