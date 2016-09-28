class Gridworld extends Environment {
	constructor(cfg) {
		super(cfg);
		if (!cfg.randomized) {
			let Cl = this.constructor;
			cfg.randomized = true;
			return Gridworld.generateRandom(Cl, cfg);
		}

		this.plots = [ExplorationPlot];
		this.obsBits = 4;
		this.grid = [];
		this.N = cfg.N;
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
			this.grid[i] = new Array(this.N);
			for (let j = 0; j < this.N; j++) {
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

		this.generateConnexions();

		if (cfg.initial) {
			this.pos = this.grid[cfg.initial.x][cfg.initial.y];
		} else {
			this.pos = this.grid[0][0];
		}
	}

	generateConnexions() {
		let grid = this.grid;
		let actions = this.actions;
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
		let N = cfg.N;
		let trapProb = cfg.trapProb || 0;
		conf.map = [];
		for (let i = 0; i < N; i++) {
			conf.map[i] = new Array(N);
			for (let j = 0; j < N; j++) {
				if (i == 0 && j == 0) {
					conf.map[i][j] = Gridworld.map_symbols.empty;
				}

				let r = Math.random();
				if (r < trapProb) {
					conf.map[i][j] = Gridworld.map_symbols.trap;
				} else if (r < 0.4) {
					conf.map[i][j] = Gridworld.map_symbols.wall;
				} else {
					conf.map[i][j] = Gridworld.map_symbols.empty;
				}
			}
		}

		for (let goal of conf.goals) {
			let g = Gridworld.proposeGoal(N);
			goal.x = g.x;
			goal.y = g.y;
			conf.map[g.y][g.x] = Gridworld.map_symbols.empty;
		}

		return conf;
	}

	static proposeGoal(N) {
		let gx = Util.randi(0, N);
		let gy = Util.randi(0, N);
		if (gx + gy < N / 2) {
			return Gridworld.proposeGoal(N);
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

		for (let i = 0; i < env.N; i++) {
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
		} else if (type == Gridworld.map_symbols.modifier) {
			tile = new SelfModificationTile(i, j);
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

		if (kind == 'mu') {
			modelClass.push(new this.constructor(cfg));
			modelWeights = [1];
		} else if (kind == 'maze') {
			cfg.randomized = false;
			for (let n = 4; n < this.config.N; n++) {
				cfg.N = n;
				for (let k = 0; k < n; k++) {
					modelClass.push(Gridworld.generateRandom(this.constructor, cfg));
					modelWeights.push(1);
				}
			}

			modelClass.push(new this.constructor(this.config));
			modelWeights.push(1);
		} else {
			let C = cfg.N * cfg.N;
			modelWeights = Util.zeros(C);

			for (let i = 0; i < cfg.N; i++) {
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

					let m = new this.constructor(cfg);

					modelClass.push(m);
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

Gridworld.params = [{ field: 'N', value: 10 }];

Gridworld.map_symbols = {
		empty: 'F',
		chocolate: 'C',
		wall: 'W',
		dispenser: 'D',
		sign: 'S',
		trap: 'T',
		modifier: 'M',
	};

class DispenserGrid extends Gridworld {
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
}

DispenserGrid.params = [{ field: 'freq', value: 0.75 }];

class WireheadingGrid extends DispenserGrid {
	dynamics(tile) {
		if (tile.constructor == SelfModificationTile) {
			this.sensors_modified = true;
			this.conditionalDistribution = e => {
				let p = this.generatePercept();
				return e.obs == p.obs && e.rew == p.rew;
			};
		}

		return this.sensors_modified ? Number.MAX_SAFE_INTEGER : 0;
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

class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.reward = function () {return Gridworld.rewards.empty;};

		this.legal = true;
		this.color = GridVisualization.colors.empty;
		this.info = [];
		this.obs = null; // gets filled out on construction
		this.symbol = 0; // what it looks like from afar
		this.connexions = new Array();
	}
}

class Wall extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return Gridworld.rewards.wall;};

		this.legal = false;
		this.color = GridVisualization.colors.wall;
		this.symbol = 1;
	}
}

class Chocolate extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return Gridworld.rewards.chocolate;};

		this.color = GridVisualization.colors.chocolate;
	}
}

class Dispenser extends Tile {
	constructor(x, y, freq) {
		super(x, y);
		this.freq = freq;
		this.color = GridVisualization.colors.dispenser;
		this.reward = function () {
			return Math.random() < this.freq ? Gridworld.rewards.chocolate : Gridworld.rewards.empty;
		};
	}
}

class Trap extends Tile {
	constructor(x, y) {
		super(x, y);
		this.color = GridVisualization.colors.trap;
		this.reward = function () {
			return Gridworld.rewards.wall;
		};
	}
}

class SelfModificationTile extends Tile {
	constructor(x, y) {
		super(x, y);
		this.color = GridVisualization.colors.modifier;
	}
}
