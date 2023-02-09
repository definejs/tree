

let idCounter = 0;

module.exports = exports = {

    create(keys = [], parent = null) { 
        let key = keys.slice(-1)[0];
        let id = `node-${idCounter++}`;
        let depth = keys.length;
        let siblings = parent ? parent.nodes : [];

        let node = {
            'id': id,                   //全局 id。
            'y': depth,                 //当前层级的深度。
            'x': 0,                     //在兄弟节点列表中的索引号（排名）。
            'key': key || '',           //当前的 key，方便后续处理。
            'keys': keys,               //从根节点到当前节点的完整路径，方便后续处理。
            'parent': parent,           //父节点。 如果为 null，则表示当前节点为根节点。
            'isRoot': !parent,          //是否为根节点。
            'key$node': {},             //子节点的容器对象。 如果为空对象 {}，则表示当前节点为叶子节点。
            'nodes': [],                //子节点列表。 如果为空数组 []，则表示当前节点为叶子节点。
            'siblings': siblings,       //兄弟节点列表。 包括自己在内。
            //'value': undefined,       //会有一个这样的字段，但先不创建。
        };

        return node;
    },

    set(node, keys, value) { 
        let parent = node;
        let maxIndex = keys.length - 1;
        let newNodes = [];


        keys.forEach(function (key, index) {
            let node = parent.key$node[key];

            //尚未存在该节点，则先创建。
            if (!node) {
                let sliceKeys = keys.slice(0, index + 1);//从根节点到当前节点的完整路径，方便后续处理。

                node = exports.create(sliceKeys, parent);
                
                parent.key$node[key] = node;
                parent.nodes.push(node);
                newNodes.push(node);

                node.x = node.siblings.length - 1;
                
            }

            if (index < maxIndex) {//准备下一轮迭代。
                parent = node;
            }
            else { //最后一项。
                node.value = value;
            }
        });

        return newNodes;
    },


    get(node, keys) {
        let { key$node, } = node;
        let maxIndex = keys.length - 1;

        for (let index = 0; index <= maxIndex; index++) {
            let key = keys[index];
            let node = key$node[key];

            if (!node || index == maxIndex) { //不存在了，或是最后一项了。
                return node || null;
            }

            key$node = node.key$node; //准备下一轮迭代。
        }
    },

    //迭代指定节点下的所有子节点。
    each(node, fn) {
        let { nodes, } = node;

        //叶子节点。
        if (!nodes.length) {
            return;
        }


        nodes.some((node, index) => { 
            let value = fn(node, index);

            // 只有在 fn 中明确返回 false 才停止循环。
            if (value === false) {
                return true;
            }

            exports.each(node, fn); //递归。
        });

        
    },
};