class Gridworld extends Environment {
	constructor(options) {
		super(options);
		if (!options.randomized) {
			var Cl = this.constructor;
			options.randomized = true;
			return Gridworld.generateRandom(Cl, options);
		}

		this.plots = [ExplorationPlot];
		this.obsBits = 4;
		this.grid = [];
		this.N = options.N;
		Util.assert(this.N);
		this.state = {};
		this.actions = Gridworld.actions;
		this.numActions = this.actions.length;
		this.reward = -1; // fix name conflict
		this.noop = 4;
		this.visits = 0;

		this.min_reward = Gridworld.rewards.wall + Gridworld.rewards.move;
		this.max_reward = Gridworld.rewards.chocolate + Gridworld.rewards.move;

		for (var i = 0; i < this.N; i++) {
			this.grid[i] = new Array(this.N);
			for (var j = 0; j < this.N; j++) {
				this.grid[i][j] = Gridworld.newTile(i, j, options, options.map[j][i]);
			}
		}

		if (options.goals) {
			this.goals = [];
			for (var goal of options.goals) {
				var type = goal.type || Gridworld.map_symbols.dispenser;
				var g = Gridworld.newTile(goal.x, goal.y, goal.freq, type);
				g.goal = true;
				this.grid[goal.x][goal.y] = g;
				this.goals.push(g);
			}
		}

		this.generateConnexions();

		if (options.initial) {
			this.pos = this.grid[options.initial.x][options.initial.y];
		} else {
			this.pos = this.grid[0][0];
		}
	}

	generateConnexions() {
		var grid = this.grid;
		var actions = this.actions;
		grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				var str = '';
				for (var a = 0; a < this.numActions; a++) {
					var i = actions[a][0];
					var j = actions[a][1];
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

	isSolvable() {
		var queue = [];
		var pos = 0;

		var maxFreq = 0;
		for (var goal of this.options.goals) {
			if (goal.freq > maxFreq) {
				maxFreq = goal.freq;
			}
		}

		for (var i = 0; i < this.N; i++) {
			for (var j = 0; j < this.N; j++) {
				this.grid[i][j].expanded = false;
			}
		}

		this.numStates = 1;
		queue.push(this.grid[0][0]);
		var solvable = false;
		while (pos < queue.length) {
			var ptr = queue[pos];
			ptr.expanded = true;
			for (var t of ptr.connexions) {
				if (!t || t.expanded) {
					continue;
				}

				this.numStates++;
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

	static generateRandom(Cl, options) {
		var opt = Gridworld.proposeRandom(options);
		var env = new Cl(opt);
		if (!env.isSolvable()) {
			return Gridworld.generateRandom(Cl, options);
		}

		return env;

	}

	static proposeRandom(options) {
		var opt = Util.deepCopy(options);
		var N = options.N;
		var trapProb = options.trapProb || 0;
		var wallProb = options.wallProb || 0.4;
		opt.map = [];
		for (var i = 0; i < N; i++) {
			opt.map[i] = new Array(N);
			for (var j = 0; j < N; j++) {
				if (i == 0 && j == 0) {
					opt.map[i][j] = Gridworld.map_symbols.empty;
				}

				var r = Math.random();
				if (r < trapProb) {
					opt.map[i][j] = Gridworld.map_symbols.trap;
				} else if (r < wallProb) {
					opt.map[i][j] = Gridworld.map_symbols.wall;
				} else {
					opt.map[i][j] = Gridworld.map_symbols.empty;
				}
			}
		}

		for (var goal of opt.goals) {
			var g = Gridworld.proposeGoal(N);
			goal.x = g.x;
			goal.y = g.y;
			opt.map[g.y][g.x] = Gridworld.map_symbols.empty;
		}

		return opt;
	}

	static proposeGoal(N) {
		var gx = Util.randi(0, N);
		var gy = Util.randi(0, N);
		if (gx + gy < N / 2) {
			return Gridworld.proposeGoal(N);
		}

		return {
			x: gx,
			y: gy,
		};

	}

	static newTile(i, j, info, type) {
		var tile;
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
		var rew = Gridworld.rewards.move;
		var t = this.pos.connexions[action];

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
		tile.dynamics();
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
		var res = new this.constructor(this.options);
		res.pos = res.grid[this.pos.x][this.pos.y];
		res.reward = this.reward;

		return res;
	}

	getState() {
		return { x: this.pos.x, y: this.pos.y };
	}

	makeModel(model, parametrization) {
		if (model == QTable) {
			return new QTable(100, this.numActions);
		}

		if (model == DirichletGrid) {
			return new DirichletGrid(this.options.N);
		}

		var modelClass = [];
		var modelWeights = [];
		var options = Util.deepCopy(this.options);

		if (parametrization == 'mu') {
			modelClass.push(new this.constructor(options));
			modelWeights = [1];
		} else if (parametrization == 'maze') {
			options.randomized = false;
			for (var n = 4; n < this.options.N; n++) {
				options.N = n;
				for (var k = 0; k < n; k++) {
					modelClass.push(Gridworld.generateRandom(this.constructor, options));
					modelWeights.push(1);
				}
			}

			modelClass.push(new this.constructor(this.options));
			modelWeights.push(1);
		} else {
			var C = options.N * options.N;
			modelWeights = Util.zeros(C);

			for (var i = 0; i < options.N; i++) {
				for (var j = 0; j < options.N; j++) {
					if (parametrization == 'goal') {
						options.goals = [
							{
								x: j,
								y: i,
								freq: options.goals[0].freq,
							},
						];
					} else if (parametrization == 'pos') {
						options.initial = { x: j, y: i };
					}

					var t = this.grid[j][i];
					if (t.constructor == Wall || !t.expanded) {
						modelWeights[i * options.N + j] = 0;
					} else {
						modelWeights[i * options.N + j] = 1 / C; // default uniform
					}

					var m = new this.constructor(options);

					modelClass.push(m);
				}
			}
		}

		// ensure prior is normalised
		var C = modelWeights.length;
		var s = Util.sum(modelWeights);
		for (var i = 0; i < C; i++) {
			modelWeights[i] /= s;
		}

		return new BayesMixture(modelClass, modelWeights);
	}

	conditionalDistribution(e) {
		var p = this.generatePercept();
		var s = this.pos;
		if (s.constructor == NoiseTile) {
			return e.rew == p.rew ? s.prob : 0;
		}

		if (e.obs != p.obs) {
			// observations are deterministic
			return 0;
		} else if (!s.goal) {
			// all tiles except the goal are deterministic
			return e.rew == p.rew ? 1 : 0;
		} else {
			var rew = e.rew - Gridworld.rewards.move;
			if (rew == Gridworld.rewards.chocolate) {
				return s.freq;
			} else if (rew == Gridworld.rewards.empty) {
				return 1 - s.freq;
			} else {
				return rew == Gridworld.rewards.wall && this.wall_hit;
			}
		}
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

Gridworld.params = [
									{ field: 'N', value: 10 },
									{ field: 'goals', value: [
										{ freq: 0.75 },
									], },
								];

Gridworld.map_symbols = {
		empty: 'F',
		chocolate: 'C',
		wall: 'W',
		dispenser: 'D',
		sign: 'S',
		trap: 'T',
		modifier: 'M',
	};

class WireheadingGrid extends Gridworld {
	dynamics(tile) {
		if (tile.constructor == SelfModificationTile) {
			this.conditionalDistribution = e => {
				var p = this.generatePercept();
				return p.rew == e.rew;
			};

			this.generatePercept = _ => {
				var p = super.generatePercept();
				p.rew = Number.MAX_SAFE_INTEGER;
				return p;
			};

			this.wireheaded = true;
		}

		return 0;
	}

	getState() {
		var s = super.getState();
		s.wireheaded = this.wireheaded;

		return s;
	}

	save() {
		super.save();
		this.saved_conditionalDistribution = this.conditionalDistribution;
		this.saved_generatePercept = this.generatePercept;
	}

	load() {
		super.load();
		this.conditionalDistribution = this.saved_conditionalDistribution;
		this.generatePercept = this.saved_generatePercept;
	}
}

class EpisodicGrid extends Gridworld {
	conditionalDistribution(e) {
		var p = this.generatePercept();
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
		this.dynamics = _ => {};
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

class NoiseTile extends Tile {
	constructor(x, y) {
		super(x, y);
		this.numObs = Math.pow(2, 2);
		this.prob = 1 / this.numObs;
		this.color = GridVisualization.colors.noise;
		this.dynamics = function () {
			this.obs = Util.randi(0, this.numObs);
		};
	}
}
