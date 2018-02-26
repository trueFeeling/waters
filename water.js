const observe = require('./observe');
const Compile = require('./compile');
const Watcher = require('./watcher');
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