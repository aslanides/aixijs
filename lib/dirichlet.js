class DirichletModel {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.actions = Gridworld.getActions();

		this.M = cfg.M;
		this.N = cfg.N;

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
		let r = wallHit ? config.rewards.wall : disp ? config.rewards.chocolate : config.rewards.empty;
		r += config.rewards.move;

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
				n.update([1, 1, 0]);
			}

			if (n.pr) {
				this.params[n.x][n.y] = n.pr.alphas;
			}
		}

		if (r - config.rewards.move == config.rewards.empty) {
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

	print(kek) {
		let lol = kek ? this.saved_params : this.params;
		for (let i = 0; i < this.M; i++) {
			for (let j = 0; j < this.N; j++) {
				console.log(`(${i},${j}): ${lol[i][j]}`);
			}
		}
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

// xi(e) {
// 	let x = 0;
// 	for (let i = 0; i < this.M; i++) {
// 		for (let j = 0; j < this.N; j++) {
// 			if (this.pos_weights[i][j] == 0) {
// 				continue;
// 			}
//
// 			let s = this.grid[i][j];
// 			x += this.pos_weights[i][j] * this.conditionalDistribution(e, s, this.last_action);
// 		}
// 	}
//
// 	Util.assert(xi != 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);
//
// 	return x;
// }
//
// conditionalDistribution(e, s, a) {
// 	// p(e|s,a)
// 	let o = e.obs;
// 	let po = 1;
//
// 	let r = e.rew - config.rewards.move;
// 	let pr = 0;
//
// 	let ne = this.neighbors(s);
// 	let oBits = [];
// 	Util.encode(oBits, o, ne.length);
//
// 	if (a == 4) {
// 		for (let i = 0; i < 4; i++) {
// 			let n = ne[i];
// 			po *= oBits[i] ? n.prob(2) : 1 - n.prob(2); // wall or not
// 		}
//
// 		pr += Util.I(r, config.rewards.empty) * s.prob(0);
// 		pr += Util.I(r, config.rewards.chocolate) * s.prob(1);
//
// 		return po * pr;
// 	}
//
// 	// non-stationary case
// 	// first term; we hit a wall
// 	for (let i = 0; i < 4; i++) {
// 		let n = ne[i];
// 		if (i == a) {
// 			po *= oBits[i] ? n.prob(2) : 0;
// 			continue;
// 		}
//
// 		po *= oBits[i] ? n.prob(2) : 1 - n.prob(2);
// 	}
//
// 	pr += Util.I(r, config.rewards.wall);
//
// 	let tmp = po * pr;
// 	po = 1; pr = 0;
//
// 	// second term; no hit
// 	let t = ne[a];
// 	ne = this.neighbors(ne[a]);
// 	let opp = a % 2 == 0 ? a + 1 : a - 1;
// 	for (let i = 0; i < 4; i++) {
// 		let n = ne[i];
// 		if (i == opp) {
// 			po *= !oBits[i];
// 			continue;
// 		}
//
// 		po *= oBits[i] ? n.prob(2) : 1 - n.prob(2);
// 	}
//
// 	po *= (1 - t.prob(2));
// 	pr += Util.I(r, config.rewards.empty) * t.prob(0);
// 	pr += Util.I(r, config.rewards.chocolate) * t.prob(1);
//
// 	return tmp + po * pr;
//
// }
