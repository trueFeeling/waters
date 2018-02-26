const Dep = require('./Dep');
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
