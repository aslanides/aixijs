class Environment {
    constructor() {
        this.actions = []
        this.reward = 0
    }
    do(action) {
        throw "Not implemented!"
    }
    generatePercept() {
        throw "Not implemented!"
    }
    conditionalDistribution(percept) {
        throw "Not implemented!"
    }
}

class Gridworld extends Environment {
    constructor(config) {
        super()
        this.config_copy = Util.deepCopy(config)
        this.grid = new Grid(config)
        this.actions = [
            function(e) {e._move(-1,0)},
            function(e) {e._move(1,0)},
            function(e) {e._move(0,1)},
            function(e) {e._move(0,-1)},
            function(e) {e._move(0,0)}
        ]
        this.pos = config.initial_pos
        this.initial_percept = this.generatePercept()
    }
    do(action) {
        this.actions[action](this)
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
    }
    _inbounds(x,y) {
        return x >= 0 && y >= 0 && x < this.grid.M && y < this.grid.N
    }
    _dynamics(tile) {}
    generatePercept() {
        // note: observations must be strings
        throw "Not implemented!"
    }
    save() {
        this.state = {
            pos : {x:this.pos.x,y:this.pos.y},
            reward : this.reward,
        }
    }
    load() {
        Util.assert(this.state != undefined,"No saved state to load!")
        this.pos = {x:this.state.pos.x,y:this.state.pos.y}
        this.reward = this.state.reward
    }
    copy() {
        var new_env = new this.constructor(this.config_copy)
        new_env.pos = {x:this.pos.x,y:this.pos.y}
        new_env.reward = this.reward

        return new_env
    }
}

class SimpleEpisodicGrid extends Gridworld {
    generatePercept() {
        return {
            obs : (this.pos.x).toString() + (this.pos.y).toString(),
            rew : this.reward
        }
    }
    conditionalDistribution(percept) {
        var p = this.generatePercept()
        return (percept.obs == p.obs && percept.rew == p.rew) ? 1 : 0 // deterministic
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = {x:0,y:0} // "episodic"
        }
    }
}

class SimpleDispenserGrid extends Gridworld {
    // partially observable. percepts are 9 bits.
    generatePercept() {
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
        return {
            obs : percept.join(""),
            rew : this.reward
        }
    }
    conditionalDistribution(percept) {
        var p = this.generatePercept()
        if (percept.obs != p.obs) {
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
            if (percept.rew == r_chocolate) {
                return f
            } else if (percept.rew == r_empty) {
                return 1-f
            } else if (percept.rew == r_wall && this.wall_hit) {
                return 1
            } else {
                return 0
            }
        } else {
            return percept.rew == p.rew ? 1 : 0
        }
    }
    _dynamics(tile) {
        for (var val of this.grid.disp) {
            this.grid.getTile(val[0],val[1]).dispense()
        }
    }
	save() {
		super.save()
		this.state.chocolate = this.grid.getDispenser().chocolate
	}
	load() {
		super.load()
		this.grid.getDispenser().chocolate = this.state.chocolate
	}
	copy() {
		var new_env = super.copy()
		new_env.grid.getDispenser().chocolate = this.grid.getDispenser().chocolate

		return new_env
	}
}
