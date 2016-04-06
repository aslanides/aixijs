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

function QTable(num_states,num_actions) {
    this.num_states = num_states
    this.num_actions = num_actions
    this._QMap = new Map()
    this._key = function(obs,action) {
        return obs * this.num_actions + action
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
