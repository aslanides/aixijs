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
			let gridrow = [];
			let pwrow = [];
			let prow = [];
			for (let jdx = 0; jdx < this.N; jdx++) {
				gridrow.push(new DirichletTile(idx, jdx));
				prow.push(gridrow[jdx].pr.alphas);
				pwrow.push(idx * jdx);
				this.weights[idx * this.N + jdx] = 0;
			}

			this.grid.push(gridrow);
			this.pos_weights.push(pwrow);
			this.params.push(prow);
		}

		this.pos_weights[0][0] = 1;
		this.weights[0] = 1;

		this.percept = null;
		this.last_action = 4;

		this.wall = new Wall(0, 0);
		this.wall.prob = i => Util.I(i, 2);
		this.wall.update = _ => _;
		this.wall.sample = _ => this.wall;

		// TODO precompute neighbors
	}

	generatePercept() {
		let nu = Util.sample(this.weights);
		let s = this.grid[nu / this.N | 0][nu % this.N];
		let ne = this.neighbors(s);
		let samples = [];
		let str = '';
		for (let n of ne) {
			let sam = n.sample();
			str += sam.symbol;
			samples.push(sam);
		}

		let a = this.last_action;
		let t = samples[a];
		if (a != 4 && !t.symbol) {
			str = '';
			let ne2 = this.neighbors(t);
			for (let n of ne2) {
				if (n == s) {
					str += 0;
					continue;
				}

				let sam = n.sample();
				str += sam.symbol;
			}

			s = ne[a];
		}

		let pEmpty = s.prob(0);
		let pDisp = s.prob(1);
		let norm = pEmpty + pDisp;
		let disp = Util.sample([pEmpty / norm, pDisp / norm]);

		let o = parseInt(str, 2);
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

		let ne = this.neighbors(s);
		let oBits = [];
		Util.encode(oBits, o, ne.length);

		if (a == 4) {
			for (let i = 0; i < 4; i++) {
				let n = ne[i];
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

		let rofl = tmp + po * pr;
		if (isNaN(rofl)) {
			throw 'fuck';
		}

		return rofl;
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
		this.bayesUpdate(a, e);
	}

	bayesUpdate(a, e) {
		let w = this.pos_weights;
		let xi = 0;

		let o = e.obs;
		let r = e.rew;
		let oBits = [];
		Util.encode(oBits, o, 4);

		for (let idx = 0; idx < this.M; idx++) {
			for (let jdx = 0; jdx < this.N; jdx++) {
				if (w[idx][jdx] == 0) {
					continue;
				}

				let p = w[idx][jdx];
				let s = this.grid[idx][jdx];
				let ne = this.neighbors(s);
				for (let i = 0; i < 4; i++) {
					let n = ne[i];
					if (oBits[i]) {
						n.update([0, 0, p]);
					} else {
						n.update([p / 2, p / 2, 0]);
					}

					if (n.pr) {
						this.params[n.x][n.y] = n.pr.alphas;
					}
				}

				if (r - config.rewards.move == config.rewards.empty) {
					s.update([p, 0, 0]);
				} else {
					s.update([0, p, 0]);
				}

				this.params[s.x][s.y] = s.pr.alphas;

				w[idx][jdx] = w[idx][jdx] * this.conditionalDistribution(e, s, this.last_action);

				if (isNaN(w[idx][jdx])) {
					console.log(this.conditionalDistribution(e, s, this.last_action));
					console.log(w);
					throw 'rofl';
				}

				xi += w[idx][jdx];

				this.weights[jdx * this.M + idx] = w[idx][jdx];
			}
		}

		for (let idx = 0; idx < this.M; idx++) {
			for (let jdx = 0; jdx < this.N; jdx++) {
				w[idx][jdx] /= xi;
			}
		}
	}

	save() {
		this.saved_params = [...this.params];
		this.saved_weights = [...this.weights];
	}

	load() {
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
