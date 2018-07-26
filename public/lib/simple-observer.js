
function SimpleObserver(target) {
    this.target = target || {};
    this.keyListeners = {};
    this.allListeners = [];
}

SimpleObserver.prototype.watch = function(key, listener) {
    if(!this.keyListeners[key]) {
        this.keyListeners[key] = [];
    };
    this.keyListeners[key].push(listener);

    var that = this;
    var unwatchUtil = function() { that.unwatch(key, listener); }
    return unwatchUtil;
};

SimpleObserver.prototype.watchAll = function(listener) {
    this.allListeners.push(listener);

    var that = this;
    var unwatchUtil = function() { that.unwatchAll(listener); }
    return unwatchUtil;
};

SimpleObserver.prototype.unwatch = function(key, listener) {
    for(var i=0; this.keyListeners[key] && i<this.keyListeners[key].length; i++) {
        var index = this.keyListeners[key].indexOf(listener);
        if(index >= 0) {
            this.keyListeners[key].splice(index, 1);
        }
    }
};

SimpleObserver.prototype.unwatchAll = function(listener) {
    var index = this.allListeners.indexOf(listener);
    if(index >= 0) {
        this.allListeners.splice(index, 1);
    }
};

SimpleObserver.prototype.notify = function(action, key, newValue, oldValue) {
    for(var i=0; this.keyListeners[key] && i<this.keyListeners[key].length; i++) {
        var listener = this.keyListeners[key][i];
        listener(key, newValue, action, oldValue);
    }

    for(var j=0; j<this.allListeners.length; j++) {
        var listener = this.allListeners[j];
        listener(key, newValue, action, oldValue);
    }
};

SimpleObserver.prototype.get = function(key) {
    return this.target[key];
};

SimpleObserver.prototype.set = function(key, newValue) {
    var oldValue = this.target[key];
    this.target[key] = newValue;
    this.notify(oldValue !== undefined ? 'updated' : 'added', key, newValue, oldValue);
};

SimpleObserver.prototype.del = function(key) {
    var oldValue = this.target[key];
    delete this.target[key];
    this.notify('deleted', key, null, oldValue);
};
