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

	save() {
		throw 'Not implemented!';
	}

	load() {
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

class IteratedPrisonersDilemma extends Environment {
	constructor(config) {
		super(config);
		this.opponent = new config.opponent();
		this.payouts = config.payouts;
		this.min_reward = this.payouts[1][0];
		this.max_reward = this.payouts[0][1];
		this.actions = ['defect', 'cooperate'];
		this.a = 1;
		this.b = 1;
		this.noop = 1;
	}

	perform(a) {
		Util.assert(a == 0 || a == 1, `Bad action: ${a}`);
		let b = this.opponent.selectAction();
		let r = this.payouts[b][a];
		this.a = a;
		this.b = b;

		this.opponent.update(a, r);
	}

	generatePercept() {
		// 0 = defect, 1 = cooperate
		return {
			obs: this.b,
			rew: this.payouts[this.a][this.b],
		};
	}

	conditionalDistribution(e) {
		let r = e.rew;
		let o = e.obs;
		let p = this.opponent.pr(o);
		return p;
	}

	save() {
		this.opponent.save();
		this.state = { a: this.a, b: this.b };
	}

	load() {
		this.a = this.state.a;
		this.b = this.state.b;
		this.opponent.load();
	}

	getState() {
		return {
			a: this.a,
			b: this.b,
			payout: this.payouts[this.a][this.b],
		};
	}

	makeModelClass(kind) {
		let opponents = IteratedPrisonersDilemma.opponents;
		let modelClass = [];
		let cfg = Util.deepCopy(this.config);
		for (let op in IteratedPrisonersDilemma.opponents) {
			cfg.opponent = IteratedPrisonersDilemma.opponents[op];
			modelClass.push(new this.constructor(cfg));
		}

		let C = modelClass.length;
		let modelWeights = Util.zeros(C);
		for (let i = 0; i < C; i++) {
			modelWeights[i] = 1 / C;
		}

		return {
			modelClass: modelClass,
			modelWeights: modelWeights,
		};
	}
}

IteratedPrisonersDilemma.opponents = {
		AlwaysCooperate,
		AlwaysDefect,
		Random,
		TitForTat,
		SuspiciousTitForTat,
		TitForTwoTats,
		Pavlov,
		Adaptive,
		Grudger,
		Gradual,
	};

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
			this.reward = Gridworld.rewards.wall;
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
	constructor(cfg) {
		super(cfg);
		if (!cfg.randomized) {
			let Cl = this.constructor;
			cfg.randomized = true;
			return Gridworld.generateRandom(Cl, cfg);
		}

		this.obsBits = 4;
		this.grid = [];
		this.M = cfg.M;
		this.N = cfg.N;
		Util.assert(this.M);
		Util.assert(this.N);
		this.state = {};
		this.actions = Gridworld.actions;
		this.numActions = this.actions.length;
		this.reward = -1; // fix name conflict
		this.noop = 4;
		this.visits = 1;

		this.min_reward = Gridworld.rewards.wall + Gridworld.rewards.move;
		this.max_reward = Gridworld.rewards.chocolate + Gridworld.rewards.move;

		for (let i = 0; i < this.N; i++) {
			this.grid[i] = new Array(this.M);
			for (let j = 0; j < this.M; j++) {
				this.grid[i][j] = Gridworld.newTile(i, j, cfg, cfg.map[j][i]);
				if (this.grid[i][j].constructor != Wall) {
					this.openTiles++;
				}
			}
		}

		if (cfg.goals) {
			this.goals = [];
			for (let goal of cfg.goals) {
				let type = goal.type || Gridworld.map_symbols.dispenser;
				let g = Gridworld.newTile(goal.x, goal.y, goal.freq, type);
				g.goal = true;
				this.grid[goal.x][goal.y] = g;
				this.goals.push(g);
			}
		}

		Gridworld.generateConnexions(this.grid, this.actions);

		if (cfg.initial) {
			this.pos = this.grid[cfg.initial.x][cfg.initial.y];
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
						grid[idx + i][jdx + j].constructor == Wall) {
						str += '1';
					} else {
						if (i || j) {
							str += '0';
						}

						if (tile.constructor != Trap && tile.constructor != Wall) {
							tile.connexions[a] = grid[idx + i][jdx + j];
						}

					}
				}

				tile.obs = parseInt(str, 2);
			});
		});
	}

	static generateRandom(Cl, cfg) {
		let conf = Gridworld.proposeRandom(cfg);
		let env = new Cl(conf);
		if (!Gridworld.isSolvable(env)) {
			return Gridworld.generateRandom(Cl, cfg);
		}

		return env;

	}

	static proposeRandom(cfg) {
		let conf = Util.deepCopy(cfg);
		let M = cfg.M;
		let N = cfg.N;

		conf.map = [];
		for (let i = 0; i < M; i++) {
			conf.map[i] = new Array(N);
			for (let j = 0; j < N; j++) {
				if (i == 0 && j == 0) {
					conf.map[i][j] = Gridworld.map_symbols.empty;
				}

				let r = Math.random();
				if (r < 0.4) {
					conf.map[i][j] = Gridworld.map_symbols.wall;
				} else {
					conf.map[i][j] = Gridworld.map_symbols.empty;
				}
			}
		}

		for (let goal of conf.goals) {
			let g = Gridworld.proposeGoal(M, N);
			goal.x = g.x;
			goal.y = g.y;
			conf.map[g.y][g.x] = Gridworld.map_symbols.empty;
		}

		return conf;
	}

	static proposeGoal(M, N) {
		let gx = Util.randi(0, M);
		let gy = Util.randi(0, N);
		if (gx + gy < M / 2) {
			return Gridworld.proposeGoal(M, N);
		}

		return {
			x: gx,
			y: gy,
		};

	}

	static isSolvable(env) {
		let queue = [];
		let pos = 0;

		let maxFreq = 0;
		for (let goal of env.config.goals) {
			if (goal.freq > maxFreq) {
				maxFreq = goal.freq;
			}
		}

		for (let i = 0; i < env.M; i++) {
			for (let j = 0; j < env.N; j++) {
				env.grid[i][j].expanded = false;
			}
		}

		env.numStates = 1;
		queue.push(env.grid[0][0]);
		let solvable = false;
		while (pos < queue.length) {
			let ptr = queue[pos];
			ptr.expanded = true;
			for (let t of ptr.connexions) {
				if (!t || t.expanded) {
					continue;
				}

				env.numStates++;
				if ((t.constructor == Dispenser && t.freq == maxFreq) || t.constructor == Chocolate) {
					solvable = true;
				}

				t.expanded = true;
				queue.push(t);
			}

			pos++;
		}

		return solvable;
	}

	static newTile(i, j, info, type) {
		let tile;
		if (type == Gridworld.map_symbols.empty) {
			tile = new Tile(i, j);
		} else if (type == Gridworld.map_symbols.wall) {
			tile = new Wall(i, j);
		} else if (type == Gridworld.map_symbols.chocolate) {
			tile = new Chocolate(i, j);
		} else if (type == Gridworld.map_symbols.dispenser) {
			tile = new Dispenser(i, j, info);
		} else if (type == Gridworld.map_symbols.trap) {
			tile = new Trap(i, j);
		} else {
			throw `Error: unknown Tile type: ${type}.`;
		}

		return tile;
	}

	perform(action) {
		let rew = Gridworld.rewards.move;
		let t = this.pos.connexions[action];

		if (t) {
			rew += t.reward();
			if (!t.visited) {
				t.visited = true;
				this.visits++;
			}

			this.pos = t;
			this.wall_hit = false;
		} else {
			rew += Gridworld.rewards.wall;
			this.wall_hit = true;
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

	makeModelClass(kind) {
		let modelClass = [];
		let modelWeights = [];
		let cfg = Util.deepCopy(this.config);

		if (kind == 'maze') {
			cfg.randomized = false;
			for (let n = 4; n < this.config.M; n++) {
				cfg.M = n;
				cfg.N = n;
				for (let k = 0; k < n; k++) {
					modelClass.push(Gridworld.generateRandom(this.constructor, cfg));
					modelWeights.push(1);
				}

			}

			modelClass.push(new this.constructor(this.config));
			modelWeights.push(1);
		} else {
			let C = cfg.M * cfg.N;
			modelWeights = Util.zeros(C);

			for (let i = 0; i < cfg.M; i++) {
				for (let j = 0; j < cfg.N; j++) {
					if (kind == 'goal') {
						cfg.goals = [
							{
								x: j,
								y: i,
								freq: cfg.goals[0].freq,
							},
						];
					} else if (kind == 'pos') {
						cfg.initial = { x: j, y: i };
					}

					if (cfg.map[i][j] == Gridworld.map_symbols.wall) {
						modelWeights[i * cfg.N + j] = 0;
					} else {
						modelWeights[i * cfg.N + j] = 1 / C; // default uniform
					}

					modelClass.push(new this.constructor(cfg));
				}
			}
		}

		// ensure prior is normalised
		let C = modelWeights.length;
		let s = Util.sum(modelWeights);
		for (let i = 0; i < C; i++) {
			modelWeights[i] /= s;
		}

		return {
			modelWeights: modelWeights,
			modelClass: modelClass,
		};
	}
}

Gridworld.actions = [
	[-1, 0], // left
	[1, 0], // right
	[0, -1], // up
	[0, 1], // down
	[0, 0], // noop
];

Gridworld.rewards = {
		chocolate: 100,
		wall: -5,
		empty: 0,
		move: -1,
	};

Gridworld.map_symbols = {
		empty: 'F',
		chocolate: 'C',
		wall: 'W',
		dispenser: 'D',
		sign: 'S',
		trap: 'T',
	};

class SimpleDispenserGrid extends Gridworld {
	conditionalDistribution(e) {
		let p = this.generatePercept();
		if (e.obs != p.obs) {
			// observations are deterministic
			return 0;
		} else if (!this.pos.goal) {
			// all tiles except the goal are deterministic
			return e.rew == p.rew ? 1 : 0;
		} else {
			let rew = e.rew - Gridworld.rewards.move;
			if (rew == Gridworld.rewards.chocolate) {
				return this.pos.freq;
			} else if (rew == Gridworld.rewards.empty) {
				return 1 - this.pos.freq;
			} else {
				return rew == Gridworld.rewards.wall && this.wall_hit;
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
		if (tile.constructor == Chocolate) {
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
		let d2 = Math.sqrt(dx * dx + dy * dy);

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
