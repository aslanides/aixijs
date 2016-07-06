class Environment {
    constructor(config) {
        this.reward = 0
		this.config = config
    }
    perform(action) {
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
	constructor(config) {
		super(config)
		this.actions = config.dists
		this.arm = 0
	}
	perform(action) {
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
	constructor(config){
		super(config)
		this.states = []
		this.actions = []
		this.no_actions = 0
		this.reward = 0
		for (var i = 0; i < config.states.length; i++) {
			var tmp = config.states[i];
			var state = new State(i)
			state.actions = tmp.actions
			this.states[i] = state;
			//Assign the actions based on the max possible from a state
			if (state.actions.length > this.no_actions) {
				this.no_actions = state.actions.length
			}
		}
		this.current_state = this.states[config.initial_state]
		//Assign the actions based on the max possible from a state
		for (var i = 0; i < this.no_actions; i++) {
			this.actions[i] = i;
		}
		this.initial_percept = this.generatePercept()
	}
	//Sample from the state list, and update reward and current state as necessary
	perform(action) {
		if (this.current_state.actions.length >= (action + 1)) {
			var old_state = this.current_state
			var weights = old_state.actions[action].probabilities
			//States are indexed by position in the probability array, so this gives us the new state index:
			var state_index =  Util.sample(weights)
			this.current_state = this.states[state_index]
			this.reward = old_state.actions[action].rewards[state_index] //check
		}
		//Illegal move
		else {
			this.reward = config.rewards.wall;
		}
	}
	generatePercept() {
        return {
            obs : this.current_state.index.toString(),
            rew : this.reward
        }
	}
	getState() {
		return this.current_state.index
	}
}

class Gridworld extends Environment {
    constructor(config) {
        super(config)
        this.config = Util.deepCopy(config)
		this.grid = []
		this.M = config.M
		this.N = config.N
		Util.assert(this.M != undefined)
		Util.assert(this.N != undefined)
		this.cl = Gridworld
		// make grid
        for (var i = 0; i < this.M; i++) {
            this.grid[i] = new Array(this.N);
            for (var j = 0; j < this.N; j++) {
                this.grid[i][j] = Tile.new(i,j,config,config.map[i][j])
			}
        }
		var gx = config.goal_pos.x
		var gy = config.goal_pos.y
		this.goal = Tile.new(gx,gy,config,config.goal_type)
		this.grid[gx][gy] = this.goal
		// grid connectivity, tile percepts
		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				var str = ''
				for (var dir of [[-1,0],[1,0],[0,1],[0,-1]]) {
					var i = dir[0]
					var j = dir[1]
					if (this.grid[idx+i] == undefined ||
						this.grid[idx+i][jdx+j] == undefined ||
						this.grid[idx+i][jdx+j].constructor.name == "Wall") {
						str += '1'
					} else {
						str += '0'
						tile.add_connexion(i,j,this.grid[idx+i][jdx+j])
					}
				}
				tile.add_connexion(0,0,tile)
				tile.obs = str
			})
		})

        this.actions = [
			function(env) {env._move(-1,0)},
			function(env) {env._move(1,0)},
			function(env) {env._move(0,-1)},
			function(env) {env._move(0,1)},
			function(env) {env._move(0,0)}
        ]
		if (config.initial_x != undefined && config.initial_y != undefined) {
			this.pos = this.grid[config.initial_x][config.initial_y]
		} else {
			this.pos = this.grid[0][0]
		}
    }
    perform(action) {
        this.actions[action](this)
    }
	_move(x,y) {
		var rew = config.rewards.move
		var t = this.pos.get_connexion(x,y)
		if (t == undefined) {
			rew += config.rewards.wall
		} else {
			this.pos = t
		}

		rew += this.pos.reward()
		rew += this._dynamics(this.pos)
		this.reward = rew
	}
    _dynamics(tile) {
		return 0
	}
	generatePercept() {
        return {
            obs : this.pos.obs,
            rew : this.reward
        }
    }
    save() {
        this.state = {
			x : this.pos.x,
			y : this.pos.y,
            reward : this.reward,
        }
    }
    load() {
        Util.assert(this.state != undefined,"No saved state to load!")
        this.pos = this.grid[this.state.x][this.state.y]
        this.reward = this.state.reward
    }
    copy() {
        var new_env = new this.constructor(this.config)
		new_env.pos = new_env.grid[this.pos.x][this.pos.y]
        new_env.reward = this.reward

        return new_env
    }
	getState() {
		return {x:this.pos.x,y:this.pos.y}
	}
	modelClass() {
		var cfg = Util.deepCopy(this.config)
		var model_class = []
		for (var i = 0; i < cfg.map.length; i++) {
			for (var j = 0; j < cfg.map[0].length; j++) {
				cfg.goal_pos = {x:i,y:j}
				model_class.push(new this.cl(cfg))
			}
		}
		return model_class
	}
}

class EpisodicGrid extends Gridworld {
	constructor(config) {
		super(config)
		this.cl = EpisodicGrid
	}
    conditionalDistribution(e) {
        var p = this.generatePercept()
        return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = this.grid[0][0]
        }
		return 0
    }
}

class DeterministicWindyGrid extends EpisodicGrid {
	constructor(config) {
		super(config)
		this.cl = DeterministicWindyGrid
		Util.assert(config.wind != undefined)
		this.wind = config.wind // note: diagonal wind not supported
	}
	_dynamics(tile) {
		var rew = config.rewards.move
		var t = tile.get_connexion(this.wind.x,this.wind.y)
		if (t == undefined) {
			rew += config.rewards.wall
		} else {
			this.pos = t
		}
		rew += this.pos.reward()
		rew += super._dynamics(tile)
		return rew
	}
	modelClass(config) {
		var cfg = Util.deepCopy(config)
		var model_class = []
		for (var dir of [[-1,0],[1,0],[0,1],[0,-1],[0,0]]) {
			cfg.wind.x = dir[0]
			cfg.wind.y = dir[1]
			model_class.push(new this.cl(cfg))
		}
		return model_class
	}
}

class SimpleEpisodicGrid extends EpisodicGrid {
	constructor(config) {
		super(config)
		this.cl = SimpleEpisodicGrid
	}
	generatePercept() {
        return {
            obs : (this.pos.x).toString() + (this.pos.y).toString(),
            rew : this.reward
        }
    }
}

class SimpleDispenserGrid extends Gridworld {
	constructor(config) {
		super(config)
		this.cl = SimpleDispenserGrid
	}
    conditionalDistribution(e) {
        var p = this.generatePercept()
        if (e.obs != p.obs) {
            return 0
        } else if (this.pos != this.goal) {
			return e.rew == p.rew ? 1 : 0
        } else {
			var rew = e.rew - config.rewards.move
			if (rew == config.rewards.chocolate) {
                return this.goal.freq // not strictly true, but makes the demos more interesting
            } else if (rew == config.rewards.empty) {
                return 1 - this.goal.freq
            } else if (rew == config.rewards.chocolate + config.rewards.wall) {
                return this.goal.freq
            } else if (rew == config.rewards.wall) {
				return 1 - this.goal.freq
			} else {
                return 0
            }
        }
    }
    _dynamics(tile) {
        this.goal.dispense()
		return 0
    }
	save() {
		super.save()
		this.state.chocolate = this.goal.chocolate
	}
	load() {
		super.load()
		this.goal.chocolate = this.state.chocolate
	}
	copy() {
		var new_env = super.copy()
		new_env.goal.chocolate = this.goal.chocolate
		return new_env
	}
}
