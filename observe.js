const Dep = require('./Dep');
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
