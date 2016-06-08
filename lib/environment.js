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
        this.config = Util.deepCopy(config)
		this.map_fix(this.config)
		this.grid = []
		this.M = config.M
		this.N = config.N
        for (var i = 0; i < this.M; i++) {
            this.grid[i] = new Array(this.N);
            for (var j = 0; j < this.N; j++) {
                var type = this.config.map ? this.config.map[i][j] : map_symbols.empty
                this.grid[i][j] = Tile.new(i,j,this.config,type)
            }
        }
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
            this.reward = rewards.wall
        } else {
            var t = this.grid[newx][newy]
            this._dynamics(t)
            this.reward = t.reward()
            if (t.legal) {
                this.pos = {x:newx,y:newy}
            }
        }
        this.wall_hit = (this.reward == rewards.wall)
    }
    _inbounds(x,y) {
        return x >= 0 && y >= 0 && x < this.M && y < this.N
    }
    _dynamics(tile) {}
    generatePercept() {
        // note: observations must be strings
        throw "Not implemented!"
    }
	map_fix(cfg) {
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
        var new_env = new this.constructor(this.config)
        new_env.pos = {x:this.pos.x,y:this.pos.y}
        new_env.reward = this.reward

        return new_env
    }
	getState() {
		return {x:this.pos.x,y:this.pos.y}
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
	map_fix(cfg) {
		var dx = cfg.chocolate_pos.x
		var dy = cfg.chocolate_pos.y
		cfg.map[dx][dy] = map_symbols.chocolate
	}
}

class PartiallyObservableGridworld extends Gridworld {
	generatePercept() {
        var percept = new Array(9)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var tt = this.grid[this.pos.x-1+i]
                if (tt == undefined) {
                    percept[3*i+j] = 1
                    continue
                }
                var t = tt[this.pos.y-1+j]
                if (t == undefined) {
                    percept[3*i+j] = 1
					continue
                }
				percept[3*i+j] = t.percept
            }
        }
        return {
            obs : percept.join(""),
            rew : this.reward
        }
    }

}

class POEpisodicGrid extends PartiallyObservableGridworld {
	conditionalDistribution(percept) {
		var p = this.generatePercept()
		return (percept.obs == p.obs && percept.rew == p.rew) ? 1 : 0 // deterministic
	}
	_dynamics(tile) {
		if (tile.constructor.name == "Chocolate") {
			this.pos = {x:0,y:0} // "episodic"
		}
	}
	map_fix(cfg) {
		var dx = cfg.chocolate_pos.x
		var dy = cfg.chocolate_pos.y
		cfg.map[dx][dy] = map_symbols.chocolate
	}
}

class SimpleDispenserGrid extends PartiallyObservableGridworld {
	constructor(config) {
		super(config)
		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				if (tile.constructor.name == "Dispenser") {
					this.dispenser = tile
				}
			})
		})
		if (this.dispenser == undefined) {
			throw "Error: No dispenser found!"
		}
	}
    conditionalDistribution(percept) {
        var p = this.generatePercept()
        if (percept.obs != p.obs) {
            return 0
        }
        if (this.pos.x == this.dispenser.x && this.pos.y == this.dispenser.y) {
			var f = this.dispenser.freq
            if (percept.rew == rewards.chocolate) {
                return f
            } else if (percept.rew == rewards.empty) {
                return 1-f
            } else if (percept.rew == rewards.wall && this.wall_hit) {
                return 1
            } else {
                return 0
            }
        } else {
            return percept.rew == p.rew ? 1 : 0
        }
    }
    _dynamics(tile) {
        this.dispenser.dispense()
    }
	map_fix(cfg) {
		var dx = cfg.dispenser_pos.x
		var dy = cfg.dispenser_pos.y
		cfg.map[dx][dy] = map_symbols.dispenser
	}
	save() {
		super.save()
		this.state.chocolate = this.dispenser.chocolate
	}
	load() {
		super.load()
		this.dispenser.chocolate = this.state.chocolate
	}
	copy() {
		var new_env = super.copy()
		new_env.dispenser.chocolate = this.dispenser.chocolate
		return new_env
	}
}

class SignPostedTigerGrid extends PartiallyObservableGridworld {
	// non-Markovian
	constructor(config) {
		
	}
}
