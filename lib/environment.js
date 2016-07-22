class Environment {
	constructor(config) {
		this.reward = 0;
		this.config = Util.deepCopy(config);
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
		this.grid = [];
		this.M = config.M;
		this.N = config.N;
		Util.assert(this.M);
		Util.assert(this.N);
		for (let i = 0; i < this.N; i++) {
			this.grid[i] = new Array(this.M);
			for (let j = 0; j < this.M; j++) {
				this.grid[i][j] = Tile.new(i, j, config, config.map[j][i]);
			}
		}

		this.actions = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1],
			[0, 0],
		];
		this.numActions = this.actions.length;
		if (config.goal_pos) {
			let gx = config.goal_pos.x;
			let gy = config.goal_pos.y;
			this.goal = Tile.new(gx, gy, config, config.goal_type);
			this.grid[gx][gy] = this.goal;
		}

		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				let str = '';
				for (let a = 0; a < this.numActions; a++) {
					let i = this.actions[a][0];
					let j = this.actions[a][1];
					if (!this.grid[idx + i] ||
						!this.grid[idx + i][jdx + j] ||
						this.grid[idx + i][jdx + j].constructor.name == 'Wall') {
						str += '1';
					} else {
						str += '0';
						tile.connexions[a] = this.grid[idx + i][jdx + j];
					}
				}

				tile.obs = str;
			});
		});

		if (config.initial_x && config.initial_y) {
			this.pos = this.grid[config.initial_x][config.initial_y];
		} else {
			this.pos = this.grid[0][0];
		}
	}

	perform(action) {
		let rew = config.rewards.move;
		let t = this.pos.connexions[action];

		if (t) {
			this.pos = t;
		} else {
			rew += config.rewards.wall;
		}

		rew += this.pos.reward();
		rew += this.dynamics(this.pos);

		this.reward = rew;
	}

	dynamics(tile) {
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
		Util.assert(this.state, 'No saved state to load!');
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
		for (let i = 0; i < cfg.M; i++) {
			for (let j = 0; j < cfg.N; j++) {
				cfg.goal_pos = { x: j, y: i };
				modelClass.push(new this.constructor(cfg));
			}
		}

		return modelClass;
	}
}

class SimpleDispenserGrid extends Gridworld {
	constructor(config) {
		super(config);
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

	dynamics(tile) {
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

class EpisodicGrid extends Gridworld {
	conditionalDistribution(e) {
		let p = this.generatePercept();
		return (e.obs == p.obs && e.rew == p.rew) ? 1 : 0;
	}

	dynamics(tile) {
		if (tile.constructor.name == 'Chocolate') {
			this.pos = this.grid[0][0];
		}

		return 0;
	}
}

class SimpleEpisodicGrid extends EpisodicGrid {
	generatePercept() {
		return {
			obs: (this.pos.x).toString() + (this.pos.y).toString(),
			rew: this.reward,
		};
	}
}

class Puckworld extends Environment {
	constructor(config) {
		super();
		this.ppx = Math.random(); // puck x,y
		this.ppy = Math.random();
		this.pvx = Math.random() * 0.05 - 0.025; // velocity
		this.pvy = Math.random() * 0.05 - 0.025;
		this.tx = Math.random(); // target
		this.ty = Math.random();
		this.tx2 = Math.random(); // target
		this.ty2 = Math.random(); // target
		this.rad = 0.05;
		this.t = 0;
		this.reward = 0;
		this.actions = new Array(5);
		this.BADRAD = 0.25;
	}

	generatePercept() {
		return { obs: this.getState(), rew: this.reward };
	}

	getState() {
		let obs = [
			this.ppx - 0.5,
			this.ppy - 0.5,
			this.pvx * 10,
			this.pvy * 10,
			this.tx - this.ppx,
			this.ty - this.ppy,
			this.tx2 - this.ppx,
			this.ty2 - this.ppy,
		];
		return obs;
	}

	perform(a) {
		// world dynamics
		this.ppx += this.pvx; // newton
		this.ppy += this.pvy;
		this.pvx *= 0.95; // damping
		this.pvy *= 0.95;

		// agent action influences puck velocity
		var accel = 0.002;
		if (a === 0) this.pvx -= accel;
		if (a === 1) this.pvx += accel;
		if (a === 2) this.pvy -= accel;
		if (a === 3) this.pvy += accel;

		// handle boundary conditions and bounce
		if (this.ppx < this.rad) {
			this.pvx *= -0.5; // bounce!
			this.ppx = this.rad;
		}

		if (this.ppx > 1 - this.rad) {
			this.pvx *= -0.5;
			this.ppx = 1 - this.rad;
		}

		if (this.ppy < this.rad) {
			this.pvy *= -0.5; // bounce!
			this.ppy = this.rad;
		}

		if (this.ppy > 1 - this.rad) {
			this.pvy *= -0.5;
			this.ppy = 1 - this.rad;
		}

		this.t += 1;
		if (this.t % 100 === 0) {
			this.tx = Math.random(); // reset the target location
			this.ty = Math.random();
		}

		// compute distances
		var dx = this.ppx - this.tx;
		var dy = this.ppy - this.ty;
		var d1 = Math.sqrt(dx * dx + dy * dy);

		var dx = this.ppx - this.tx2;
		var dy = this.ppy - this.ty2;
		var d2 = Math.sqrt(dx * dx + dy * dy);

		var dxnorm = dx / d2;
		var dynorm = dy / d2;
		var speed = 0.001;
		this.tx2 += speed * dxnorm;
		this.ty2 += speed * dynorm;

		// compute reward
		var r = -d1; // want to go close to green
		if (d2 < this.BADRAD) {
			// but if we're too close to red that's bad
			r += 2 * (d2 - this.BADRAD) / this.BADRAD;
		}

		this.reward = r;
	}
}
