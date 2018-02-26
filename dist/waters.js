/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

let uid = 0;
function Dep() {
    this.id = uid++;
    this.subs = [];
}
//对每一个属性，new一个dep
//dep的subs队列里面，是该属性在每一个dom的watcher
Dep.prototype = {
    addSubs: function (watcher) {
        this.subs.push(watcher);
    },
    depend: function () {
        Dep.target.addDep(this);
    },
    notify: function(){
        this.subs.forEach(sub => {
            sub.update();
        });
    }
};


Dep.target = null;

module.exports = Dep;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Dep = __webpack_require__(0);
module.exports = Watcher;
function Watcher(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb = cb;
    this.depId = {};
    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn);
        if (!this.getter) {
            this.getter = function () { }
            console.log(
                `Failed watching path: "${expOrFn}" ` +
                'Watcher only accepts simple dot-delimited paths. ' +
                'For full control, use a function instead.',
                vm
            )
        }
    }
    this.value = this.get();
};

Watcher.prototype = {
    addDep: function (dep) {
        //如果该watcher不在这个dep里面，添加进去
        if (!this.depId.hasOwnProperty(dep.id)) {
            dep.addSubs(this);
            this.depId[dep.id] = dep;
        }
    },
    update: function () {
        const newVal = this.get();
        const oldVal = this.value;
        if(newVal !== oldVal){
            this.value = newVal;
            this.cb.call(this.vm, newVal, oldVal);
        }
    },
    get: function () {
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value
    },
    parseGetter: function (expOrFn) {
        expOrFn = expOrFn.split('.');
        return function (obj) {
            expOrFn.forEach(pro => {
                obj = obj[pro];
            });
            return obj
        }
    }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const observe = __webpack_require__(3);
const Compile = __webpack_require__(4);
const Watcher = __webpack_require__(1);
window.Water = function (opt) {
    this.opt = opt;
    let _data = this._data = opt.data;
    Object.keys(_data).forEach(pro=>{
        this._proxyData(pro, _data[pro]);
    });
    this._initComputed();
    observe(_data, this);
    this.compile = new Compile(opt.el || document.body, this);
}

Water.prototype = {
    $watch: function(key, cb, options) {
        return new Watcher(this, key, cb);
    },
    _proxyData: function(pro, val){
        Object.defineProperty(this, pro, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter(){
                return val
            },
            set: function proxySetter(newVal){
                val = newVal;
            }
        })
    },
    _initComputed: function() {
        var me = this;
        var computed = this.opt.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Dep = __webpack_require__(0);
function Observer(data){
    this.data = data;
    this.walk(this.data);
}

Observer.prototype = {
    walk: function(data){
        Object.keys(data).forEach(dataPro=>{
            let val = data[dataPro];
            this.convert(data, dataPro, val);
        });
    },
    convert: function(obj, pro, val){
        observe(val);
        this.defineReactive(obj, pro, val);    
    },
    defineReactive: function(obj, pro, val){
        const dep = new Dep();
        Object.defineProperty(obj, pro, {
            enumerable: true,
            configurable: true,
            get: function getVal(){
                if(Dep.target){
                    dep.depend();
                }
                return val;
            },
            set: function setVal(newVal){
                if (newVal === val)return;
                //(typeof val !== 'object') && console.log('you have set ', pro, ' to ', newVal);
                observe(newVal);
                val = newVal;
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    if (!value || typeof value !== 'object')return;
    return new Observer(value);
}
 

module.exports = observe;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const Watcher = __webpack_require__(1);
module.exports = Compile;

function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    node2Fragment: function(el) {
        let fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    },

    init: function() {
        this.compileElement(this.$fragment);
    },

    compileElement: function(el) {
        let childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(node=>{
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        });
    },

    compile: function(node) {
        let nodeAttrs = node.attributes;

        [].slice.call(nodeAttrs).forEach(attr=>{
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(2);
                // 事件指令
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.$vm, exp, dir);
                    // 普通指令
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        });
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },

    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        return node.nodeType == 1;
    },

    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};

// 指令处理集合
let compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        let me = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function(e) {
            let newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        let eventType = dir.split(':')[1],
            fn = vm.opt.methods && vm.opt.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function(vm, exp) {
        let val = vm;
        exp = exp.split('.');
        exp.forEach(pro=>{
            val = val[pro];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        let val = vm;
        exp = exp.split('.');
        exp.forEach((pro, index)=>{
            // 非最后一个key，更新val的值
            if (index < exp.length - 1) {
                val = val[pro];
            } else {
                val[pro] = value;
            }
        });
    }
};


let updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },

    classUpdater: function(node, value, oldValue) {
        let className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        let space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
};

/***/ })
/******/ ]);