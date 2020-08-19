# tree.js

树形结构的存储类。

``` javascript
const Tree = require('@definejs/tree');
let tree = new Tree();

tree.set('path', 'to', 123);    //
tree.get('path', 'to');         //return 123
tree.remove('path', 'to');      //delete node: `path -> to`

tree.set(['foo', 'bar', 'test'], 456);
tree.get(['foo', 'bar', 'test']); //return 456



```