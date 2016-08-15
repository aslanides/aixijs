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
			obs: this.arm,
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
		let numActions = 0;
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
			obs: this.current.index,
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
		this.obsBits = 4;
		this.grid = [];
		this.M = config.M;
		this.N = config.N;
		Util.assert(this.M);
		Util.assert(this.N);
		this.state = {};
		this.actions = Gridworld.getActions();
		this.numActions = this.actions.length;

		for (let i = 0; i < this.N; i++) {
			this.grid[i] = new Array(this.M);
			for (let j = 0; j < this.M; j++) {
				this.grid[i][j] = Tile.new(i, j, config, config.map[j][i]);
			}
		}

		if (config.goals) {
			this.goals = [];
			for (let goal of config.goals) {
				let g = Tile.new(goal.pos.x, goal.pos.y, goal.freq, goal.type);
				g.goal = true;
				this.grid[goal.pos.x][goal.pos.y] = g;
				this.goals.push(g);
			}
		}

		Gridworld.generateConnexions(this.grid, this.actions);

		if (config.initial) {
			this.pos = this.grid[config.initial.x][config.initial.y];
		} else {
			this.pos = this.grid[0][0];
		}
	}

	static generateConnexions(grid, actions) {
		let numActions = actions.length;
		grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				let str = '';
				for (let a = 0; a < numActions; a++) {
					let i = actions[a][0];
					let j = actions[a][1];
					if (!grid[idx + i] ||
						!grid[idx + i][jdx + j] ||
						grid[idx + i][jdx + j].constructor.name == 'Wall') {
						str += '1';
					} else {
						if (i || j) {
							str += '0';
						}

						tile.connexions[a] = grid[idx + i][jdx + j];
					}
				}

				tile.obs = parseInt(str, 2);
			});
		});
	}

	static getActions() {
		return [
			[-1, 0], // left
			[1, 0], // right
			[0, -1], // up
			[0, 1], // down
			[0, 0], // noop
		];
	}

	perform(action) {
		let rew = config.rewards.move;
		let t = this.pos.connexions[action];

		if (t) {
			rew += t.reward();
			this.pos = t;
		} else {
			rew += config.rewards.wall;
		}

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
}

class SimpleDispenserGrid extends Gridworld {
	conditionalDistribution(e) {
		let p = this.generatePercept();
		if (e.obs != p.obs) {
			// percepts are deterministic
			return 0;
		} else if (!this.pos.goal) {
			// all tiles except the goal are deterministic
			return e.rew == p.rew ? 1 : 0;
		} else {
			let rew = e.rew - config.rewards.move;
			if (rew == config.rewards.chocolate ||
				rew == config.rewards.chocolate + config.rewards.wall) {
				return this.pos.freq;
			} else if (rew == config.rewards.empty ||
						rew == config.rewards.wall) {
				return 1 - this.pos.freq;
			} else {
				return 0;
			}
		}
	}

	dynamics(tile) {
		return 0;
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
			obs: this.pos.x + this.pos.y * this.M,
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
		let accel = 0.002;
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
		let dx = this.ppx - this.tx;
		let dy = this.ppy - this.ty;
		let d1 = Math.sqrt(dx * dx + dy * dy);

		dx = this.ppx - this.tx2;
		dy = this.ppy - this.ty2;
		d2 = Math.sqrt(dx * dx + dy * dy);

		let dxnorm = dx / d2;
		let dynorm = dy / d2;
		let speed = 0.001;
		this.tx2 += speed * dxnorm;
		this.ty2 += speed * dynorm;

		// compute reward
		let r = -d1; // want to go close to green
		if (d2 < this.BADRAD) {
			// but if we're too close to red that's bad
			r += 2 * (d2 - this.BADRAD) / this.BADRAD;
		}

		this.reward = r;
	}
}
