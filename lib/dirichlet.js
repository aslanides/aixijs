class DirichletModel {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.actions = Gridworld.getActions();

		this.M = cfg.M;
		this.N = cfg.N;

		this.grid = [];
		this.weights = [];
		this.pos_weights = [];
		this.params = [];
		for (let idx = 0; idx < this.M; idx++) {
			this.grid.push([]);
			this.pos_weights.push([]);
			this.params.push([]);
			for (let jdx = 0; jdx < this.N; jdx++) {
				this.grid[idx].push(new DirichletTile(idx, jdx));
				this.params[idx].push(this.grid[jdx].pr.alphas);
				this.pos_weights[idx].push(1 / (this.M * this.N));
				this.weights[idx * this.N + jdx] = this.pos_weights[idx][jdx];
			}
		}

		this.percept = null;
		this.last_action = 4;

		this.wall = new Wall(0, 0);
		this.wall.prob = i => Util.I(i, 2);
		this.wall.sample = _ => this.wall;

		// TODO precompute neighbors
	}

	generatePercept() {
		let nu = Util.sample(this.weights);
		let s = this.grid[s / this.N | 0][s % this.N];
		let ne = this.neighbors(s);
		let samples = [];
		let str = '';
		for (let n of ne) {
			let sam = n.sample();
			str += sam.obs;
			samples.push(sam);
		}

		let a = this.last_action;
		let t = samples[a];
		if (!t.obs) {
			str = '';
			let ne2 = this.neighbors(t);
			for (let n of ne2) {
				if (n == s) {
					str += 0;
					continue;
				}

				let sam = n.sample();
				str += sam.obs;
			}

			s = t;
		}

		let pEmpty = s.prob(0);
		let pDisp = s.prob(1);
		let norm = pEmpty + pDisp;
		let disp = Util.sample([pEmpty / norm, pDisp / norm]);

		let o = parseInt(o, 2);
		let r = disp ? config.rewards.chocolate : config.rewards.empty;
		r += config.rewards.move;

		return { obs: o, rew: r };
	}

	xi(e) {
		let x = 0;
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				if (this.pos_weights[i][j] == 0) {
					continue;
				}

				let s = this.grid[i][j];
				x += this.pos_weights[i][j] * this.conditionalDistribution(e, s, this.last_action);
			}
		}

		Util.assert(x != 0, `The agent's Bayesian mixture assigns 0 probability to the percept
			(${e.obs},${e.rew})`);

		return x;
	}

	conditionalDistribution(e, s, a) {
		// p(e|s,a)

		let o = e.obs;
		let po = 1;

		let r = e.rew - config.rewards.move;
		let pr = 0;

		let oBits = [];
		let ne = this.neighbors(s);

		for (let n of ne) {
			oBits.push(o % 2);
			o = o / 2 | 0;
		}

		if (a == 4) {
			for (let i = 0; i < 4; i++) {
				po *= oBits[i] ? n.prob(2) : 1 - n.prob(2); // wall or not
			}

			pr += Util.I(r, config.rewards.empty) * s.prob(0);
			pr += Util.I(r, config.rewards.chocolate) * s.prob(1);

			return po * pr;
		}

		// non-stationary case
		// first term; we hit a wall
		for (let i = 0; i < 4; i++) {
			let n = ne[i];
			if (i == a) {
				po *= oBits[i] ? n.prob(2) : 0;
				continue;
			}

			po *= oBits[i] ? n.prob(2) : 1 - n.prob(2);
		}

		pr += Util.I(r, config.rewards.wall);

		let tmp = po * pr;
		po = 1; pr = 0;

		// second term; no hit
		let t = ne[a];
		ne = this.neighbors(ne[a]);
		let opp = a % 2 == 0 ? a + 1 : a - 1;
		for (let i = 0; i < 4; i++) {
			let n = ne[i];
			if (i == opp) {
				po *= !oBits[i];
				continue;
			}

			po *= oBits[i] ? n.prob(2) : 1 - n.prob(2);
		}

		po *= (1 - t.prob(2));
		pr += Util.I(r, config.rewards.empty) * t.prob(0);
		pr += Util.I(r, config.rewards.chocolate) * t.prob(1);

		return tmp + po * pr;
	}

	neighbors(s) {
		let ne = [];
		for (let dir of this.actions) {
			if (dir[0] == 0 && dir[1] == 0) {
				continue; // don't return self
			}

			let newx = s.x + dir[0];
			let newy = s.y + dir[1];
			if (this.outofBounds(newx, newy)) {
				ne.push(this.wall);
				continue;
			}

			ne.push(this.grid[newx][newy]);
		}

		return ne;
	}

	outofBounds(x, y) {
		return x < 0 || y < 0 || x >= this.M || y >= this.N;
	}

	perform(a) {
		this.last_action = a;
	}

	update(a, e) {
		this.perform(a);

		let pos = this.pos;
		let rew = e.rew - config.rewards.move;
		let bitvec = [
				rew == config.rewards.empty,
				rew == config.rewards.chocolate,
				rew == config.rewards.wall,
			];

		pos.pr.update(bitvec);
		this.params[pos.x][pos.y] = pos.pr.alphas;
		this.weights[pos.y * this.M + pos.x] = pos.prob(2);
	}

	bayesUpdate(a, e) {
		// TODO
		return;
	}

	save() {
		this.state = {
			x: this.pos.x,
			y: this.pos.y,
		};
		this.saved_params = [...this.params];
		this.saved_weights = [...this.weights];
	}

	load() {
		this.pos = this.grid[this.state.x][this.state.y];
		this.params = [...this.saved_params];
		this.weights = [...this.saved_weights];
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				let t = this.grid[i][j];
				t.pr.alphas = this.params[i][j];
				t.pr.alphaSum = Util.sum(t.pr.alphas);
			}
		}
	}
}
