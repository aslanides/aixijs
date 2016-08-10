class DirichletModel {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.actions = Gridworld.getActions();
		this.grid = [];
		this.M = cfg.M; // TODO kek
		this.N = cfg.N;
		this.weights = [];
		for (let idx = 0; idx < this.M; idx++) {
			let row = [];
			for (let jdx = 0; jdx < this.N; jdx++) {
				row.push(new DirichletTile(idx, jdx));
				this.weights[idx * this.N + jdx] = 0.5;
			}

			this.grid.push(row);
		}

		this.pos = this.grid[0][0];
		this.percept = null;
		this.perform(4); // identity on gridworlds

		this.params = [];
		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				this.params.push(tile.pr.alphas);
			});
		});
	}

	generatePercept() {
		return this.percept;
	}

	conditionalDistribution(e) {
		return;
	}

	outofBounds(x, y) {
		return x < 0 || y < 0 || x >= this.M || y >= this.N;
	}

	perform(a) {
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
		this.params[pos.y * this.M + pos.x] = pos.pr.alphas;
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
				t.pr.alphas = this.params[i * this.M + j];
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
		this.pr = new Dirichlet([1, 1, 1]);
	}

	sample() {
		let p = this.pr.mean();
		let kek = Util.sample(p);

		return this.children[kek];
	}
}
