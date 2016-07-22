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
				tile.dispenser = new Dispenser(idx, jdx, cfg.goals[0].freq); // TODO generalize
				tile.dispenser.obs = tile.obs;
				tile.dispenser.goal = true;
				tile.pr = 1 / (this.M * this.N);
				this.weights[idx * this.N + jdx] = tile.pr;
			});
		});
		this.env.dynamics = function () {return 0;};
	}

	generatePercept() {
		let pos = this.env.pos;
		let obs = pos.obs;
		let rew = this.env.reward;
		if (Math.random() < pos.pr) {
			rew += pos.dispenser.reward();
		}

		return {
			obs: obs,
			rew: rew,
		};
	}

	prGivenD(e) {
		let tmp = this.env.pos;
		this.env.pos = this.env.pos.dispenser;
		let p = this.env.conditionalDistribution(e);
		this.env.pos = tmp;
		return p;
	}

	conditionalDistribution(e) {
		let p1 = this.prGivenD(e); // p(e|D)
		let p2 = this.env.conditionalDistribution(e); // p(e|~D)
		let pr = this.env.pos.pr;

		return pr * p1 + (1 - pr) * p2; // p(e) = p(e|D)p(D) + p(e|~D)p(~D)
	}

	perform(a) {
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				this.env.grid[i][j].dispenser.dispense();
			}
		}

		this.env.perform(a);
	}

	update(a, e) {
		this.perform(a);
		let pos = this.env.pos;
		let pe = this.conditionalDistribution(e);
		let peD = this.prGivenD(e);
		if (pe == 0) {
			if (peD != 0) {
				throw 'Bad news';
			} else {
				return;
			}
		}

		// p(D|e) = p(D)p(e|D)/p(e)
		pos.pr = pos.pr * peD / pe;
		this.weights[pos.y * this.M + pos.x] = pos.pr;
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
				row[j] = this.env.grid[i][j].dispenser.chocolate;
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
