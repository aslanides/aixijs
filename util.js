var zeros = function(n) {
    /*
        (int) -> Array

    */
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

var argmax = function(Q,s,na) {
    /*
    arg max over actions for Q in state s.

    breaks ties uniformly at random

    Inputs: (Q, state, num_actions)

    (Array,int,int) -> int

    */
    var Q_max = Number.NEGATIVE_INFINITY
    var ties = []
    for (a = 0; a < na; a++) {
        Qtmp = Q[get_idx(s,a,na)]
        if (Qtmp < Q_max) {
            continue
        } else if (Qtmp > Q_max) {
            ties = [a]
            Q_max = Qtmp
        } else {
            ties.push(a)
        }
    }
    return random_choice(ties)
}

var argmax_shit = function(Q,s,na) {
    var Q_max = Number.NEGATIVE_INFINITY
    var a_max
    for (a = 0; a < na; a++) {
        Qtmp = Q[get_idx(s,a,na)]
        if (Qtmp > Q_max) {
            a_max = a
            Q_max = Qtmp
        }
    }
    return a_max
}

var random_choice = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

var get_idx = function(s,a,na) {
    /* (observation, action, num_actions)

    (int,int,int) -> int

    */
    return s*na+a
}
