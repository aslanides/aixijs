class Environment {
    constructor() {
        this.actions = []
        this.reward = 0
        this.nu = function(o,r) {
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
        this.actions = [
            function(e) {return e._move(-1,0)},
            function(e) {return e._move(1,0)},
            function(e) {return e._move(0,1)},
            function(e) {return e._move(0,-1)},
            function(e) {return e._move(0,0)}
        ]
        this.pos = config.initial_pos
        this.initial_percept = this._encodePercept()
        this.optimal_average_reward = config.optimal_average_reward
    }
    perform(action) {
        return this.actions[action](this)
    }
    _move(xx,yy) {
        var newx = this.pos.x + xx
        var newy = this.pos.y + yy
        if (!this._inbounds(newx,newy)) {
            this.reward = r_wall
        } else {
            var t = this.grid.getTile(newx,newy)
            this._dynamics(t)
            this.reward = t.reward()
            if (t.legal) {
                this.pos = {x:newx,y:newy}
            }
        }
        this.wall_hit = (this.reward == r_wall)
        return this._encodePercept()
    }
    _inbounds(x,y) {
        return x >= 0 && y >= 0 && x < this.grid.M && y < this.grid.N
    }
    _dynamics(tile) {}
    _encodePercept() {
        // note: observations must be strings
        throw "Not implemented!"
    }
    save() {
        this.state = {
            pos : this.pos,
            reward : this.reward,
            chocolate :  this.grid.getDispenser().chocolate
        }
    }
    load() {
        Util.assert(this.state != undefined,"No saved state to load!")

        this.pos = this.state.pos
        this.reward = this.state.reward
        this.grid.getDispenser().chocolate = this.state.chocolate
    }
}

class SimpleEpisodicGrid extends Gridworld {
    _encodePercept() {
        var o = (this.pos.x).toString() + (this.pos.y).toString()
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
    _encodePercept() {
        var percept = new Array(9)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var tt = this.grid.getRow(this.pos.x-1+i)
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
                    f = this.grid.getTile(val[0],val[1]).freq
                    disp = true
                    break
                }
            }
            if (disp) {
                if (rew == r_chocolate) {
                    return f
                } else if (rew == r_empty) {
                    return 1-f
                } else if (rew == r_wall && this.wall_hit) {
                    return 1
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
            this.grid.getTile(val[0],val[1]).dispense()
        }
    }
}
