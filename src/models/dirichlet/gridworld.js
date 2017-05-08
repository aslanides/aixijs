class DirichletGrid {
	constructor(N) {
		this.actions = Gridworld.actions;
		this.A = this.actions.length;
		this.N = N;

		this.grid = [];
		this.params = [];
		this.weight_queue = new Queue()
		this.param_queue = new Queue()

		for (let idx = 0; idx < this.N; idx++) {
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

		this.weights = Util.zeros(this.N * this.N);
		for (let i = 0; i < this.N * this.N; i++) {
			this.weights[i] = this.grid[0][0].prob(1); // Haldane prior
		}

		this.saved_weights = [...this.weights];

		this.wall = new Wall(0, 0);
		this.wall.prob = i => Util.I(i, 2);
		this.wall.update = _ => _;
		this.wall.sample = _ => this.wall;

		this.pos = this.grid[0][0];

		for (let i = 0; i < this.N; i++) {
			for (let j = 0; j < this.N; j++) {
				let t = this.grid[i][j];
				let ne = [];
				for (let dir of this.actions) {
					if (dir[0] == 0 && dir[1] == 0) {
						continue; // don't return self
					}

					let newx = t.x + dir[0];
					let newy = t.y + dir[1];
					if (newx < 0 || newy < 0 || newx >= this.N || newy >= this.N) {
						ne.push(this.wall);
						continue;
					}

					ne.push(this.grid[newx][newy]);
				}

				t.neighbors = ne;
			}
		}

		this.perform(4);
		this.pos.update(0);
		this.pos.update(1);
	}

	generatePercept() {
		return this.e;
	}

	xi(e) {
		let o = e.obs;
		let r = e.rew;
		let oBits = [];
		Util.encode(oBits, o, this.A - 1);
		oBits.reverse();

		let s = this.pos;

		let p = 1;
		let ne = s.neighbors;
		for (let i = 0; i < this.A - 1; i++) {
			if (oBits[i]) {
				p *= ne[i].prob(2); // wall
			} else {
				p *= (1 - ne[i].prob(2));
			}
		}

		let rew = r - Gridworld.rewards.move;
		if (rew == Gridworld.rewards.chocolate) {
			p *= s.prob(1);
		} else if (rew == Gridworld.rewards.empty) {
			p *= s.prob(0);
		}

		return p;
	}

	perform(a) {
		let s = this.pos;

		let samples = [];
		for (let i = 0; i < s.neighbors.length; i++) {
			samples.push(s.neighbors[i].sample());
		}

		let t = samples[a];

		let str = '';
		for (let sam of samples) {
			str += sam.symbol;
		}

		let wallHit = false;

		// if agent moved, we have to re-sample
		if (a != 4 && !t.symbol) {
			str = '';
			let ne2 = this.grid[t.x][t.y].neighbors;
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

		this.e = { obs: o, rew: r };
	}

	bayesUpdate(a, e) {
		var o = e.obs;
		var r = e.rew;
		var oBits = [];
		Util.encode(oBits, o, this.A - 1);
		oBits.reverse();

		var s = this.pos;
		var ne = s.neighbors;
		for (var i = 0; i < this.A - 1; i++) {
			var n = ne[i];
			if (!n.pr) {
				continue;
			}

			if (oBits[i]) {
				n.update(2); // wall
			} else {
				if (n.pr.alphas[0] == 0 && n.pr.alphas[1] == 0) {
					n.update(0);
					n.update(1);
				}
			}

			this.weights[n.y * this.N + n.x] = n.prob(1);
			this.weight_queue.append(n.y * this.N + n.x)

			if (n.pr) {
				this.params[n.x][n.y] = n.pr.alphas;
				this.param_queue.append([n.x,n.y])
			}
		}

		var rew = r - Gridworld.rewards.move;

		if (rew == Gridworld.rewards.empty) {
			s.update(0);
		} else if (rew == Gridworld.rewards.chocolate) {
			s.update(1);
		}

		this.params[s.x][s.y] = s.pr.alphas;
		this.param_queue.append([s.x,s.y])
		this.weights[s.y * this.N + s.x] = s.prob(1);
		this.weight_queue.append(s.y * this.N + s.x)
	}

	update(a, e) {
		this.perform(a);
		this.bayesUpdate(a, e);
	}

	entropy() {
		// TODO fix this: currently O(N^2), should be O(m)
		return Util.entropy(this.weights)
	}

	save() {
		for (let i = 0; i < this.N; i++) {
			this.saved_params[i] = Util.arrayCopy(this.params[i]);
		}

		this.saved_pos = { x: this.pos.x, y: this.pos.y };
		this.saved_weights = [...this.weights];
	}

	load() {
		this.pos = this.grid[this.saved_pos.x][this.saved_pos.y]
		while (!this.param_queue.isempty()) {
			var [i,j] = this.param_queue.remove()
			for (var k = 0; k < 4; k++) {
				this.params[i][j][k] = this.saved_params[i][j][k]
			}
			//this.params[i][j] = Util.arrayCopy(this.saved_params[i][j])
			var t = this.grid[i][j]
			t.pr.alphas = this.params[i][j]
			t.pr.alphaSum = Util.sum(t.pr.alphas)
		}

		while (!this.weight_queue.isempty()) {
			var idx = this.weight_queue.remove()
			this.weights[idx] = this.saved_weights[idx]
		}
	}

	load2() {
		for (let i = 0; i < this.N; i++) {
			this.params[i] = Util.arrayCopy(this.saved_params[i]);
		}

		this.pos = this.grid[this.saved_pos.x][this.saved_pos.y];
		this.weights = [...this.saved_weights];

		for (let i = 0; i < this.N; i++) {
			for (let j = 0; j < this.N; j++) {
				let t = this.grid[i][j];
				t.pr.alphas = this.params[i][j];
				t.pr.alphaSum = Util.sum(t.pr.alphas);
			}
		}
	}
}

class DirichletTile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.children = [];
		this.children.push(new Tile(x, y));
		this.children.push(new Dispenser(x, y, 1));
		this.children.push(new Wall(x, y));
		this.children.push(new Trap(x, y));
		for (let child of this.children) {
			child.parent = this;
		}

		this.pr = new Dirichlet([0, 0, 0, 0]);
	}

	sample() {
		let p = this.pr.means();
		let idx = Util.sample(p);

		return this.children[idx];
	}

	update(cls) {
		this.pr.update(cls);
	}

	prob(i) {
		return this.pr.mean(i);
	}
}
