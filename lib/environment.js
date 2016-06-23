class Environment {
    constructor() {
        this.reward = 0
    }
    do(action) {
        throw "Not implemented!"
    }
    generatePercept() {
        throw "Not implemented!"
    }
    conditionalDistribution(e) {
        throw "Not implemented!"
    }
	getState() {
		throw "Not implemented!"
	}
}

class Bandit extends Environment {
	constructor(dists) {
		super()
		this.actions = dists
		this.arm = 0
		this.initial_percept = {obs: 0, rew: 0}
	}
	do(action) {
		this.arm = action
	}
	generatePercept() {
		return {
			obs : 0,
			rew : this.actions[this.arm].sample()
		}
	}
	conditionalDistribution(e) {
		return this.actions[this.arm].prob()
	}
	modelClass(dists) {
		// TODO generalize from Gaussians
		var model_class = []
		// TODO
	}
	getState() {
		return this.arm
	}
}

class BasicMDP extends Environment {
	// TODO
}

class Gridworld extends Environment {
    constructor(config) {
        super()
        this.config = Util.deepCopy(config)
		this.grid = []
		this.M = config.M
		this.N = config.N
        for (var i = 0; i < this.M; i++) {
            this.grid[i] = new Array(this.N);
            for (var j = 0; j < this.N; j++) {
                var type = config.map ? config.map[i][j] : map_symbols.empty
                this.grid[i][j] = Tile.new(i,j,config,type)
            }
        }
		var gx = config.goal_pos.x
		var gy = config.goal_pos.y
		this.grid[gx][gy] = Tile.new(gx,gy,config,config.goal_type)
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
        if (newx < 0 || newy < 0 || newx >= this.M || newy >= this.N) {
            this.reward = rewards.wall
        } else {
            var t = this.grid[newx][newy]
            this._dynamics(t)
            this.reward = t.reward()
			if (xx != 0 && yy != 0) {
				this.reward += rewards.move
			}
            if (t.legal) {
                this.pos = {x:newx,y:newy}
            }
        }
        this.wall_hit = (this.reward == rewards.wall)
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
        var new_env = new this.constructor(this.config)
        new_env.pos = {x:this.pos.x,y:this.pos.y}
        new_env.reward = this.reward

        return new_env
    }
	getState() {
		return {x:this.pos.x,y:this.pos.y}
	}
	modelClass(config) {
		var cfg = Util.deepCopy(config)
		var model_class = []
		for (var i = 0; i < cfg.map.length; i++) {
			for (var j = 0; j < cfg.map[0].length; j++) {
				cfg.goal_pos = {x:i,y:j}
				model_class.push(new this.constructor(cfg))
			}
		}
		return model_class
	}
}

class SimpleEpisodicGrid extends Gridworld {
    generatePercept() {
        return {
            obs : (this.pos.x).toString() + (this.pos.y).toString(),
            rew : this.reward
        }
    }
    conditionalDistribution(e) {
        var p = this.generatePercept()
        return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = {x:0,y:0} // "episodic"
        }
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
	conditionalDistribution(e) {
		var p = this.generatePercept()
		return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0 // deterministic
	}
	_dynamics(tile) {
		if (tile.constructor.name == "Chocolate") {
			this.pos = {x:0,y:0} // "episodic"
		}
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
    conditionalDistribution(e) {
        var p = this.generatePercept()
        if (e.obs != p.obs) {
            return 0
        }
        if (this.pos.x == this.dispenser.x && this.pos.y == this.dispenser.y) {
			var f = this.dispenser.freq
            if (e.rew == rewards.chocolate) {
                return f
            } else if (e.rew == rewards.empty) {
                return 1-f
            } else if (e.rew == rewards.wall && this.wall_hit) {
                return 1
            } else {
                return 0
            }
        } else {
            return e.rew == p.rew ? 1 : 0
        }
    }
    _dynamics(tile) {
        this.dispenser.dispense()
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
