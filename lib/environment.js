class Environment {
	constructor(config) {
		this.reward = 0;
		this.config = config;
	}

	perform(action) {
		throw 'Not implemented!';
	}

	generatePercept() {
		throw 'Not implemented!';
	}

	conditionalDistribution(e) {
		throw 'Not implemented!';
	}

	getState() {
		throw 'Not implemented!';
	}

	makeModelClass() {
		return null;
	}
}

class Bandit extends Environment {
	constructor(config) {
		super(config);
		this.actions = [];
		for (let param of config.params) {
			this.actions.push(new config.dist(param));
		}

		this.arm = 0;
	}

	perform(action) {
		this.arm = action;
	}

	generatePercept() {
		return {
			obs: this.arm.toString(),
			rew: this.actions[this.arm].sample(),
		};
	}

	conditionalDistribution(e) {
		return this.actions[this.arm].prob();
	}

	getState() {
		return this.arm;
	}
}

class BasicMDP extends Environment {
	constructor(config) {
		super(config);
		this.states = [];
		var numActions = 0;
		config.states.forEach((state, idx) => {
			this.states.push({
				index: idx,
				actions: [...state.actions],
			});
			if (state.actions.length > numActions) {
				numActions = state.actions.length;
			}
		});
		this.actions = new Array(numActions);
		this.current = this.states[config.initial_state];
	}

	perform(action) {
		if (this.current.actions.length > action) {
			let old = this.current;
			let weights = old.actions[action].probabilities;
			let stateIndex =  Util.sample(weights);
			this.current = this.states[stateIndex];
			this.reward = old.actions[action].rewards[stateIndex];
		} else {
			this.reward = config.rewards.wall;
		}
	}

	generatePercept() {
		return {
						obs: this.current.index.toString(),
						rew: this.reward,
					};
	}

	getState() {
		return this.current.index;
	}
}

class Gridworld extends Environment {
	constructor(config) {
		super(config);
		this.config = Util.deepCopy(config);
		this.grid = [];
		this.M = config.M;
		this.N = config.N;
		Util.assert(this.M != undefined);
		Util.assert(this.N != undefined);
		this.cl = Gridworld;
		for (let i = 0; i < this.M; i++) {
			this.grid[i] = new Array(this.N);
			for (let j = 0; j < this.N; j++) {
				this.grid[i][j] = Tile.new(i, j, config, config.map[i][j]);
			}
		}

		let gx = config.goal_pos.x;
		let gy = config.goal_pos.y;
		this.goal = Tile.new(gx, gy, config, config.goal_type);
		this.grid[gx][gy] = this.goal;
		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				let str = '';
				for (let dir of [[-1, 0], [1, 0], [0, 1], [0, -1]]) {
					let i = dir[0];
					let j = dir[1];
					if (this.grid[idx + i] == undefined ||
						this.grid[idx + i][jdx + j] == undefined ||
						this.grid[idx + i][jdx + j].constructor.name == 'Wall') {
						str += '1';
					} else {
						str += '0';
						tile.addConnexion(i, j, this.grid[idx + i][jdx + j]);
					}
				}

				tile.addConnexion(0, 0, tile);
				tile.obs = str;
			});
		});

		this.actions = [
			env => env._move(-1, 0),
			env => env._move(1, 0),
			env => env._move(0, -1),
			env => env._move(0, 1),
			env => env._move(0, 0),
		];
		if (config.initial_x != undefined && config.initial_y != undefined) {
			this.pos = this.grid[config.initial_x][config.initial_y];
		} else {
			this.pos = this.grid[0][0];
		}
	}

	perform(action) {
		this.actions[action](this);
	}

	_move(x, y) {
		let rew = config.rewards.move;
		let t = this.pos.getConnexion(x, y);
		if (t == undefined) {
			rew += config.rewards.wall;
		} else {
			this.pos = t;
		}

		rew += this.pos.reward();
		rew += this._dynamics(this.pos);
		this.reward = rew;
	}

	_dynamics(tile) {
		return 0;
	}

	generatePercept() {
		return {
						obs: this.pos.obs,
						rew: this.reward,
					};
	}

	save() {
		this.state = {
			x: this.pos.x,
			y: this.pos.y,
			reward: this.reward,
		};
	}

	load() {
		Util.assert(this.state != undefined, 'No saved state to load!');
		this.pos = this.grid[this.state.x][this.state.y];
		this.reward = this.state.reward;
	}

	copy() {
		let res = new this.constructor(this.config);
		res.pos = res.grid[this.pos.x][this.pos.y];
		res.reward = this.reward;

		return res;
	}

	getState() {
		return { x: this.pos.x, y: this.pos.y };
	}

	makeModelClass() {
		let cfg = Util.deepCopy(this.config);
		let modelClass = [];
		for (let i = 0; i < cfg.map.length; i++) {
			for (let j = 0; j < cfg.map[0].length; j++) {
				cfg.goal_pos = { x: i, y: j };
				modelClass.push(new this.cl(cfg));
			}
		}

		return modelClass;
	}
}

class EpisodicGrid extends Gridworld {
	constructor(config) {
		super(config);
		this.cl = EpisodicGrid;
	}

	conditionalDistribution(e) {
		let p = this.generatePercept();
		return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0;
	}

	_dynamics(tile) {
		if (tile.constructor.name == 'Chocolate') {
			this.pos = this.grid[0][0];
		}

		return 0;
	}
}

class DeterministicWindyGrid extends EpisodicGrid {
	constructor(config) {
		super(config);
		this.cl = DeterministicWindyGrid;
		Util.assert(config.wind != undefined);
		this.wind = config.wind; // note: diagonal wind not supported
	}

	_dynamics(tile) {
		let rew = config.rewards.move;
		let t = tile.getConnexion(this.wind.x, this.wind.y);
		if (t == undefined) {
			rew += config.rewards.wall;
		} else {
			this.pos = t;
		}

		rew += this.pos.reward();
		rew += super._dynamics(tile);
		return rew;
	}

	modelClass(config) {
		let cfg = Util.deepCopy(config);
		let modelClass = [];
		for (let dir of [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]]) {
			cfg.wind.x = dir[0];
			cfg.wind.y = dir[1];
			modelClass.push(new this.cl(cfg));
		}

		return modelClass;
	}
}

class SimpleEpisodicGrid extends EpisodicGrid {
	constructor(config) {
		super(config);
		this.cl = SimpleEpisodicGrid;
	}

	generatePercept() {
		return {
						obs: (this.pos.x).toString() + (this.pos.y).toString(),
						rew: this.reward,
					};
	}
}

class SimpleDispenserGrid extends Gridworld {
	constructor(config) {
		super(config);
		this.cl = SimpleDispenserGrid;
	}

	conditionalDistribution(e) {
		let p = this.generatePercept();
		if (e.obs != p.obs) {
			return 0;
		} else if (this.pos != this.goal) {
			return e.rew == p.rew ? 1 : 0;
		} else {
			let rew = e.rew - config.rewards.move;
			if (rew == config.rewards.chocolate) {
				return this.goal.freq; // not strictly true, but makes the demos more interesting
			} else if (rew == config.rewards.empty) {
				return 1 - this.goal.freq;
			} else if (rew == config.rewards.chocolate + config.rewards.wall) {
				return this.goal.freq;
			} else if (rew == config.rewards.wall) {
				return 1 - this.goal.freq;
			} else {
				return 0;
			}
		}
	}

	_dynamics(tile) {
		this.goal.dispense();
		return 0;
	}

	save() {
		super.save();
		this.state.chocolate = this.goal.chocolate;
	}

	load() {
		super.load();
		this.goal.chocolate = this.state.chocolate;
	}

	copy() {
		let res = super.copy();
		res.goal.chocolate = this.goal.chocolate;
		return res;
	}
}
