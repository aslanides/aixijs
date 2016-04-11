var zeros = function(n) {
  if(typeof(n)==='undefined' || isNaN(n)) { return []; }
  if(typeof ArrayBuffer === 'undefined') {
    // lacking browser support
    var arr = new Array(n);
    for(var i=0;i<n;i++) { arr[i] = 0; }
    return arr;
  } else {
    return new Float64Array(n);
  }
}

var random_choice = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function QTable() {
    this._QMap = new Map()
    this._key = function(obs,action) {
        return obs + action // obs is string, so cast action to string and concatenate
    }
    this.get = function(obs,action) {
        var val = this._QMap.get(this._key(obs,action))
        if (val == undefined) {
            return 0
        }
        return val
    }
    this.set = function(obs,action,value) {
        this._QMap.set(this._key(obs,action),value)
    }
}

function doc_get(str) {
    return document.getElementById(str).value
}

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed"
        throw new Error(message)
    }
}
