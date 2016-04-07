class Environment {
    constructor() {
        this.actions = []
        this.reward = 0
        this.optimal_average_reward = 0
        this.nu = function() {
            throw "Not implemented"
        }
    }
    perform(action) {
        throw "Not implemented!"
    }
}

class Gridworld extends Environment {
    constructor(config) {
        super()
        this.grid = new Grid(config)
        this.optimal_average_reward = config.optimal_average_reward
        this.actions = [
            function(e) {return e._move(-1,0)},
            function(e) {return e._move(1,0)},
            function(e) {return e._move(0,1)},
            function(e) {return e._move(0,-1)},
            function(e) {return e._move(0,0)}
        ]
        this.pos = {
            x : 0,
            y : 0
        }
        this.initial_state = 0
    }
    perform(action) {
        return this.actions[action](this)
    }
    _move(xx,yy) {
        var newx = this.pos.x + xx
        var newy = this.pos.y + yy
        if (!this._inbounds(newx,newy)) {
            this.reward = -1
        } else {
            var t = this.grid.get_tile(newx,newy)
            this.reward = t.reward()
            this._dynamics(t)
            if (t.legal) {
                this.pos = {x:newx,y:newy}
            }
        }
        return this._encode_percept()
    }
    _inbounds(x,y) {
        return x >= 0 && y >= 0 && x < this.grid.M && y < this.grid.N
    }
    _dynamics(tile) {}
    _encode_percept() {
        throw "Not implemented!"
    }
}

class SimpleEpisodicGrid extends Gridworld {
    _encode_percept() {
        var o = this.grid.M * this.pos.x + this.pos.y
        var r = this.reward
        this.nu = function(obs,rew) {
            return obs == o && rew == r ? 1 : 0 // deterministic
        }
        return {
            obs : o,
            rew : r
        }
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = {x:0,y:0} // "episodic"
        }
    }
}

class SimpleDispenserGrid extends Gridworld {
    // partially observable. percepts are 9 bits.
    _encode_percept() {
        var percept = new Array(9)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var tt = this.grid.get_row(this.pos.x-1+i)
                if (tt == undefined) {
                    percept[3*i+j] = 1
                    continue
                }
                var t = tt[this.pos.y-1+j]
                if (t == undefined) {
                    percept[3*i+j] = 1
                    continue
                } else if (t.constructor.name == "Tile") {
                    percept[3*i+j] = 0
                } else {
                    percept[3*i+j] = 1
                }
            }
        }
        var o = percept.join("")
        var r = this.reward
        this.nu = function(obs,rew) {
            if (obs != o) {
                return 0
            }
            var f = 0
            var disp = false
            for (var val of this.grid.disp) {
                if (this.pos.x == val[0] && this.pos.y == val[1]) {
                    f = this.grid.get_tile(val[0],val[1]).freq
                    disp = true
                    break
                }
            }
            if (disp) {
                if (rew == r_chocolate) {
                    return f
                } else if (rew == r_empty) {
                    return 1-f
                } else {
                    return 0
                }
            } else {
                return rew == r ? 1 : 0
            }
        }
        return {
            obs : o,
            rew : r
        }
    }
    _dynamics(tile) {
        for (var val of this.grid.disp) {
            this.grid.get_tile(val[0],val[1]).dispense()
        }
    }
}
