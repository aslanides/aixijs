class Util {
    static zeros(n) {
        return new Float64Array(n)
    }
    static random_choice(arr) {
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
    static deepcopy(obj) {
        return jQuery.extend(true,{},obj)
    }
    static arraycopy(arr) {
        return jQuery.extend(true,[],arr)
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
