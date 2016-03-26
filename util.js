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
    this.QArr = zeros(this.num_states * this.num_actions)
    this.idx = function(obs,action) {
        return obs * this.num_actions + action
    }
    this.get = function(obs,action) {
        return this.QArr[this.idx(obs,action)]
    }
    this.set = function(obs,action,value) {
        this.QArr[this.idx(obs,action)] = value
    }
}
