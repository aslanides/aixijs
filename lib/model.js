class Model {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.config.goals = null;

		// TODO: generalize to other environments
		this.env = new SimpleDispenserGrid(this.config);
		this.M = cfg.M;
		this.N = cfg.N;
		this.weights = [];
		this.env.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				let t = new Dispenser(idx, jdx, 0.5);
				t.pr = new BetaDistribution(1, 1);
				t.obs = tile.obs;
				t.connexions = tile.connexions;
				t.goal = true;
				this.env.grid[idx][jdx] = t;
				this.weights[idx * this.N + jdx] = 0.5;
			});
		});
		Gridworld.generateConnexions(this.env.grid, this.env.actions);

		this.env.dynamics = function () {
			for (let i = 0; i < this.M; i++) {
				for (let j = 0; j < this.N; j++) {
					this.grid[i][j].dispense();
				}
			}

			return 0;
		};
	}

	generatePercept() {
		return this.env.generatePercept();
	}

	conditionalDistribution(e) {
		return this.env.conditionalDistribution(e);
	}

	perform(a) {
		this.env.perform(a);
	}

	update(a, e) {
		this.perform(a);
		let pos = this.env.pos;
		let rew = e.rew - config.rewards.move;
		pos.pr.update(rew == config.rewards.chocolate || rew == config.rewards.wall);
		pos.freq = pos.pr.mean();
		this.weights[pos.y * this.M + pos.x] = pos.pr.mean();
	}

	save() {
		this.state = {
			x: this.env.pos.x,
			y: this.env.pos.y,
			reward: this.env.reward,
		};
		this.state.chocolates = new Array(this.M);
		for (let i = 0; i < this.M; i++) {
			let row = new Array(this.N);
			for (let j = 0; j < this.N; j++) {
				row[j] = this.env.grid[i][j].chocolate;
			}

			this.state.chocolates[i] = row;
		}

		this.saved_weights = [...this.weights];
	}

	load() {
		this.env.pos = this.env.grid[this.state.x][this.state.y];
		this.env.reward = this.state.reward;
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				this.env.grid[i][j].chocolate = this.state.chocolates[i][j];
			}
		}

		this.weights = this.saved_weights;
	}

	debug() {
		this.env.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				console.log(tile.pr);
			});
			console.log('--');
		});
	}
}
