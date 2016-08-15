class DirichletModel {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.actions = Gridworld.getActions();

		this.M = cfg.M; // TODO kek
		this.N = cfg.N;

		this.weights = [];
		this.grid = [];
		this.pos_weights = [];
		this.params = [];
		for (let idx = 0; idx < this.M; idx++) {
			this.grid.push([]);
			this.pos_weights.push([]);
			this.params.push([]);
			for (let jdx = 0; jdx < this.N; jdx++) {
				this.grid[i].push(new DirichletTile(idx, jdx));
				this.pos_weights[i].push(1 / (this.M * this.N));
				this.params[i].push(this.grid[j].pr.alphas);
				this.weights[idx * this.N + jdx] = 0.5;
			}
		}

		this.percept = null;
		this.perform(4); // identity on gridworlds

		this.wall = new Wall(0, 0);
		this.wall.pr = {};
		this.wall.pr.mean = i => i == 2;

		// TODO precompute neighbors
	}

	generatePercept() {
		return this.percept;
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
				po *= oBits[i] ? n.pr.mean(2) : 1 - n.pr.mean(2); // wall or not
			}

			pr += Util.I(r, config.rewards.empty) * s.pr.mean(0);
			pr += Util.I(r, config.rewards.chocolate) * s.pr.mean(1);

			return po * pr;
		}

		// non-stationary case
		// first term; we hit a wall
		for (let i = 0; i < 4; i++) {
			let n = ne[i];
			if (i == a) {
				po *= oBits[i] ? n.pr.mean(2) : 0;
				continue;
			}

			po *= oBits[i] ? n.pr.mean(2) : 1 - n.pr.mean(2);
		}

		pr += Util.I(r, config.rewards.wall);

		let tmp = po * pr;
		po = 1; pr = 0;

		// second term; no hit
		let kek = ne[a];
		ne = this.neighbors(ne[a]);
		let opp = a % 2 == 0 ? a + 1 : a - 1;
		for (let i = 0; i < 4; i++) {
			let n = ne[i];
			if (i == opp) {
				po *= !oBits[i];
				continue;
			}

			po *= oBits[i] ? n.pr.mean(2) : 1 - n.pr.mean(2);
		}

		po *= (1 - kek.pr.mean(2));
		pr += Util.I(r, config.rewards.empty) * kek.pr.mean(0);
		pr += Util.I(r, config.rewards.chocolate) * kek.pr.mean(1);

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
		this.last_state = this.pos;

		let str = '';
		let rew = 0;
		let action = this.actions[a];

		let x = this.pos.x + action[0];
		let y = this.pos.y + action[1];
		let kek = false;
		if (this.outofBounds(x, y)) {
			rew += config.rewards.wall;
			kek = true;
		} else {
			let t = this.grid[x][y].sample();
			kek = (t.constructor.name == 'Wall');
			rew += t.reward();
		}

		if (!kek) {
			this.pos = this.grid[x][y];
		}

		for (let dir of this.actions) {
			if (dir[0] == 0 && dir[1] == 0) {
				str += '0';
				continue;
			}

			if (dir[0] == action[0] && dir[1] == action[1] && kek) {
				str += '1';
				continue;
			}

			let x = this.pos.x + dir[0];
			let y = this.pos.y + dir[1];
			if (this.outofBounds(x, y)) {
				str += '1';
				continue;
			}

			let t = this.grid[x][y].sample();
			if (t.constructor.name == 'Wall') {
				str += '1';
			} else {
				str += '0';
			}
		}

		let obs = parseInt(str, 2);

		this.last_action = a;

		this.percept = { obs: obs, rew: rew };
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
		this.weights[pos.y * this.M + pos.x] = pos.pr.mean(2);
	}

	bayesUpdate(a, e) {
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
