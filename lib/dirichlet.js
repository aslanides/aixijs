class DirichletModel {
	constructor(options) {
		this.config = Util.deepCopy(options.config);
		this.actions = Gridworld.getActions();

		this.M = this.config.M;
		this.N = this.config.N;

		this.grid = [];
		this.params = [];
		for (let idx = 0; idx < this.M; idx++) {
			let gridrow = [];
			let prow = [];
			for (let jdx = 0; jdx < this.N; jdx++) {
				gridrow.push(new DirichletTile(idx, jdx));
				prow.push(gridrow[jdx].pr.alphas);
			}

			this.grid.push(gridrow);
			this.params.push(prow);
		}

		this.saved_params = [];

		this.weights = Util.zeros(this.M * this.N);
		this.saved_weights = Util.zeros(this.M * this.N);

		this.wall = new Wall(0, 0);
		this.wall.prob = i => Util.I(i, 2);
		this.wall.update = _ => _;
		this.wall.sample = _ => this.wall;

		this.pos = this.grid[0][0];

		this.neighbors = [];
		for (let i = 0; i < this.M; i++) {
			let row = [];
			for (let j = 0; j < this.N; j++) {
				row.push(this.getNeighbors(i, j));
			}

			this.neighbors.push(row);
		}

		this.perform(4);
		this.grid[0][0].update([1, 1, 0]);
	}

	generatePercept() {
		return this.percept;
	}

	perform(a) {
		let s = this.pos;

		let samples = this.sampleNeighbors(s);
		let t = samples[a];

		let str = '';
		for (let sam of samples) {
			str += sam.symbol;
		}

		let wallHit = false;

		// if agent moved, we have to re-sample
		if (a != 4 && !t.symbol) {
			str = '';
			let ne2 = this.neighbors[t.x][t.y];
			for (let n of ne2) {
				if (n == s) {
					str += 0;
					continue;
				}

				let sam = n.sample();
				str += sam.symbol;
			}

			s = t.parent;
		} else if (a != 4 && t.symbol) {
			wallHit = true;
		}

		this.pos = s;

		let pEmpty = s.prob(0);
		let pDisp = s.prob(1);
		let norm = pEmpty + pDisp;
		let disp = Util.sample([pEmpty / norm, pDisp / norm]);

		let o = parseInt(str, 2);
		let r = Gridworld.rewards.empty;
		if (wallHit) {
			r = Gridworld.rewards.wall;
		} else if (disp) {
			r = Gridworld.rewards.chocolate;
		}

		r += Gridworld.rewards.move;

		this.percept = { obs: o, rew: r };
	}

	bayesUpdate(a, e) {
		let o = e.obs;
		let r = e.rew;
		let oBits = [];
		Util.encode(oBits, o, 4);
		oBits.reverse();

		let s = this.pos;
		let ne = this.neighbors[s.x][s.y];
		for (let i = 0; i < 4; i++) {
			let n = ne[i];
			if (oBits[i]) {
				n.update([0, 0, 1]);
			} else {
				if (n.prob(0) == n.prob(1)) {
					n.update([1, 1, 0]);
				}
			}

			if (n.pr) {
				this.params[n.x][n.y] = n.pr.alphas;
			}
		}

		if (r - Gridworld.rewards.move == Gridworld.rewards.empty) {
			s.update([1, 0, 0]);
		} else {
			s.update([0, 1, 0]);
		}

		this.params[s.x][s.y] = s.pr.alphas;
	}

	update(a, e) {
		this.perform(a);
		this.bayesUpdate(a, e);
	}

	sampleNeighbors(s) {
		let ne = this.neighbors[s.x][s.y];
		let samples = [];

		for (let n of ne) {
			let sam = n.sample();
			samples.push(sam);
		}

		return samples;
	}

	getNeighbors(x, y) {
		let ne = [];
		for (let dir of this.actions) {
			if (dir[0] == 0 && dir[1] == 0) {
				continue; // don't return self
			}

			let newx = x + dir[0];
			let newy = y + dir[1];
			if (newx < 0 || newy < 0 || newx >= this.M || newy >= this.N) {
				ne.push(this.wall);
				continue;
			}

			ne.push(this.grid[newx][newy]);
		}

		return ne;
	}

	save() {
		for (let i = 0; i < this.M; i++) {
			this.saved_params[i] = Util.arrayCopy(this.params[i]);
		}

		this.saved_pos = { x: this.pos.x, y: this.pos.y };
		this.saved_weights = [...this.weights];
	}

	load() {
		for (let i = 0; i < this.M; i++) {
			this.params[i] = Util.arrayCopy(this.saved_params[i]);
		}

		this.pos = this.grid[this.saved_pos.x][this.saved_pos.y];
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
