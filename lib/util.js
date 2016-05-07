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

	static deepMap(object){
		var static_map = new MyMap()
		var map = object.map	
		for (var [key, value] of map) {
  			static_map.map.set(key, value)
		}
		return static_map
	}


    static arrayCopy(arr) {
        return jQuery.extend(true,[],arr)
    }
    static roundTo(x,figs) {
        var tmp = Math.pow(10,figs)
        return Math.round(x * tmp)/tmp
    }
}

class Trace {
    constructor() {
        this.rewards = []
        this.positions = []
        this.qs = []
		this.q_map = [] //50 elements for each jump
		this.a = []
    }
}

class MyMap {
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
}
