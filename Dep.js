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