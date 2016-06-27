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
		Util.assert(this.M != undefined)
		Util.assert(this.N != undefined)

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
			() => this._move(-1,0),
			() => this._move(1,0),
			() => this._move(0,-1),
			() => this._move(0,1),
			() => this._move(0,0)
        ]
		if (config.initial_x != undefined && config.initial_y != undefined) {
			this.pos = this.grid[config.initial_x][config.initial_y]
		} else {
			this.pos = this.grid[0][0]
		}
    }
    do(action) {
        this.actions[action]()
    }
	_move(x,y) {
		var rew = rewards.move
		var t = this.pos.get_connexion(x,y)
		if (t == undefined) {
			rew += rewards.wall
		} else {
			this.pos = t
		}

		rew += this.pos.reward()
		this._dynamics(this.pos)
		this.reward = rew
	}
    _dynamics(tile) {}
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
	static modelClass(cl,config) {
		var cfg = Util.deepCopy(config)
		var model_class = []
		for (var i = 0; i < cfg.map.length; i++) {
			for (var j = 0; j < cfg.map[0].length; j++) {
				cfg.goal_pos = {x:i,y:j}
				model_class.push(new cl(cfg))
			}
		}
		return model_class
	}
}

class EpisodicGrid extends Gridworld {
    conditionalDistribution(e) {
        var p = this.generatePercept()
        return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = this.grid[0][0]
        }
    }
}

class SimpleEpisodicGrid extends EpisodicGrid {
	generatePercept() {
        return {
            obs : (this.pos.x).toString() + (this.pos.y).toString(),
            rew : this.reward
        }
    }
}

class SimpleDispenserGrid extends Gridworld {
    conditionalDistribution(e) {
        var p = this.generatePercept()
        if (e.obs != p.obs) {
            return 0
        } else if (this.pos != this.goal) {
			return e.rew == p.rew ? 1 : 0
        } else {
			var rew = e.rew - rewards.move
			if (rew == rewards.chocolate) {
                return this.goal.freq
            } else if (rew == rewards.empty) {
                return 1 - this.goal.freq
            } else if (rew == rewards.chocolate + rewards.wall) {
                return this.goal.freq
            } else if (rew == rewards.wall) {
				return 1 - this.goal.freq
			} else {
                return 0
            }
        }
    }
    _dynamics(tile) {
        this.goal.dispense()
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
