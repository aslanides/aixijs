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
	constructor(config){
		super()
		//Initialise the list of states
		this.config = config //Needed for state locations in vis
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
	do(action) {
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

class State {
    constructor(index) {
        this.index = index;
		this.actions = []; //each action will have a list of transition probabilities (state to transition = index in array)
    }
	static new(index){
		return new State(index)
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
        return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0 // deterministic
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = {x:0,y:0} // "episodic"
        }
    }
	map_fix(cfg) {
		cfg.map[cfg.goal_pos.x][cfg.goal_pos.y] = map_symbols.chocolate
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
	map_fix(cfg) {
		cfg.map[cfg.goal_pos.x][cfg.goal_pos.y] = map_symbols.chocolate
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
	map_fix(cfg) {
		cfg.map[cfg.goal_pos.x][cfg.goal_pos.y] = map_symbols.dispenser
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
