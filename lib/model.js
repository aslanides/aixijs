class Model {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.config.goal_pos = null;

		// no dispensers
		this.env = new SimpleDispenserGrid(cfg);
		this.M = cfg.M;
		this.N = cfg.N;
		this.env.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				tile.dispenser = new Dispenser(idx, jdx, cfg.freq);
				tile.pr = 1 / (this.M * this.N);
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

	conditionalDistribution(e) {
		let tmp = this.env.pos;
		this.env.goal = this.env.pos.dispenser;
		this.env.pos = this.env.pos.dispenser;
		let p1 = this.env.conditionalDistribution(e);
		this.env.pos = tmp;
		this.env.goal = null;
		let p2 = this.env.conditionalDistribution(e);
		let pr = this.env.pos.pr;
		return pr * p1 + (1 - pr) * p2;
	}

	perform(a) {
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				this.env.grid[i][j].dispenser.dispense();
			}
		}

		this.env.perform(a);
	}

	save() {
		this.env.save();
	}

	load() {
		this.env.load();
	}

	update(a, e) {
		// TODO
		return;
	}
}
