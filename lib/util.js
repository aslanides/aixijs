class Util {
    static zeros(n) {
        return new Float64Array(n)
    }
    static randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
    static assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed"
            throw new Error(message)
        }
    }
    static sum(arr) {
        var s = 0
        for (var i = 0; i < arr.length; i++) {
            s += arr[i]
        }
        return s
    }
    static deepCopy(obj) {
        return jQuery.extend(true,{},obj)
    }
    static arrayCopy(arr) {
        return jQuery.extend(true,[],arr)
    }
    static roundTo(x,figs) {
        var tmp = Math.pow(10,figs)
        return Math.round(x * tmp)/tmp
    }
    static sample(weights) {
        var s = Math.random()
        var p = 0
        for (var i = 0; i < weights.length; i++) {
            if (s <= p) {
                return i-1
            }
            p += weights[i]
        }
        return weights.length - 1
    }
    static KLDivergence(p,q) {
        Util.assert(p.length == q.length)
        var s = 0
        for (var i = 0; i < p.length; i++) {
			if (p[i] == 0 || q[i] == 0) {
				continue
			}
            s += p[i] * Math.log2(p[i]/q[i])
        }
		return s
    }
	static logProgress(t,T) {
		var prog = (t+1)/T * 100
		if (prog % 10 == 0) {
			console.log('Progress:' + prog + "%")
		}
	}
	static softMax(lst,j) {
		var s = 0
		lst.forEach(x => {
			s += Math.pow(Math.E,x)
		})
		return Math.pow(Math.E,j) / s
	}
	static sigmoid(x) {
		return 1.0/(1+Math.exp(-x));
	}
}

class QTable {
    constructor() {
        this.map = new Map()
    }
    get(obs,action) {
        var val = this.map.get(obs + action)
        if (val == undefined) {
            return 0
        }
        return val
    }
    set(obs,action,value) {
        this.map.set(obs + action,value)
    }
	copy(){
		var res = new QTable()
		for (var [key, value] of this.map) {
			res.map.set(key, value)
		}
		return res
	}
}
