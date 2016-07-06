class Util {
    static zeros(n) {
        return new Float64Array(n)
    }
    static randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
    static assert(condition, message) {
        if (!condition) {
            message = message || 'Assertion failed'
            throw new Error(message)
        }
    }
    static sum(arr) {
        let s = 0
        for (let i = 0; i < arr.length; i++) {
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
        let tmp = Math.pow(10,figs)
        return Math.round(x * tmp)/tmp
    }
	//TODO: for dictionary
    static sample(weights) {
        let s = Math.random()
        let p = 0
        for (let i = 0; i < weights.length; i++) {
            if (s <= p) {
                return i-1
            }
            p += weights[i]
        }
        return weights.length - 1
    }
    static KLDivergence(p,q) {
        Util.assert(p.length == q.length)
        let s = 0
        for (let i = 0; i < p.length; i++) {
			if (p[i] == 0 || q[i] == 0) {
				continue
			}
            s += p[i] * Math.log2(p[i]/q[i])
        }
		return s
    }
	static entropy(p) {
		let s = 0
		p.forEach(x => x > 0 ? s -= x * Math.log2(x) : null)
		return s
	}
	static logProgress(t,T) {
		let prog = (t+1)/T * 100
		if (prog % 10 == 0) {
			console.clear()
			console.log('Progress:' + prog + '%')
		}
	}
	static softMax(lst,j) {
		let s = 0
		lst.forEach(x => {
			s += Math.pow(Math.E,x)
		})
		return Math.pow(Math.E,j) / s
	}
	static randInts(n) {
		let arr = new Array(n)
		for (let i = 0; i < n; i++) {
			arr[i] = i
		}
		let max = n - 1
		let r
		let swap
		while (max > 0) {
			r = Math.floor(Math.random() * max)
			swap = arr[r]
			arr[r] = arr[max]
			arr[max] = swap
			max--
		}
		return arr
	}
}

class QTable {
    constructor() {
        this.map = new Map()
    }
    get(obs,action) {
        let val = this.map.get(obs + action)
        if (val == undefined) {
            return 0
        }
        return val
    }
    set(obs,action,value) {
        this.map.set(obs + action,value)
    }
	copy(){
		let res = new QTable()
		for (let [key, value] of this.map) {
			res.map.set(key, value)
		}
		return res
	}
}

class State {
    constructor(index) {
        this.index = index;
		this.actions = []; //each action will have a list of transition probabilities (state to transition = index in array)
    }
	static new(index){
		return new State(index)
	}
}
