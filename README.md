# tree.js

树形结构的存储类。

``` javascript
const Tree = require('@definejs/tree');
let tree = new Tree();

tree.set(['path', 'to'], 123);      //
tree.get(['path', 'to']);           //return 123
tree.remove(['path', 'to']);        //delete node value: `path -> to`

tree.set(['foo', 'bar', 'test'], 456);
tree.get(['foo', 'bar', 'test']); //return 456

```


``` javascript
const Tree = require('@definejs/tree');

let list = [
    'Reset',
    'Reset/Header',
    'Reset/Main',
    'Reset/Main/API',
    'Reset/Main/Step1',
    'Reset/Main/Step1/API',
    'Reset/Main/Step1/Code',
    'Reset/Main/Step1/Footer',
    'Reset/Main/Step1/Phone',
    'Reset/Main/Step2',
    'Reset/Main/Step2/Footer',
    'Reset/Main/Step2/Password',
    'Reset/Success',
];

let tree = new Tree(list, '/');  //or: let tree = new Tree(list);
let lines = tree.render();

console.log(lines.join('\n'));

//output the tree GUI.
└── Reset
   ├── Header
   ├── Main
   │   ├── API
   │   ├── Step1
   │   │   ├── API
   │   │   ├── Code
   │   │   ├── Footer
   │   │   └── Phone
   │   └── Step2
   │      ├── Footer
   │      └── Password
   └── Success


```