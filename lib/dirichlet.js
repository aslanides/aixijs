class DirichletModel {
	constructor(cfg) {
		this.config = Util.deepCopy(cfg);
		this.config.goals = null;
		this.actions = new Gridworld(cfg).actions;
		this.grid = [];
		this.M = cfg.M;
		this.N = cfg.N;
		for (let idx = 0; idx < this.M; idx++) {
			let row = [];
			for (let jdx = 0; jdx < this.N; jdx++) {
				row.push(new DirichletTile(idx, jdx));
			}

			this.grid.push(row);
		}

		this.pos = this.grid[0][0];
		this.percept = null;
		this.perform(4);
	}

	generatePercept() {
		return this.percept;
	}

	conditionalDistribution(e) {
		return;
	}

	perform(a) {
		// TODO: using obs as integers now, fix
		let obs = '';
		let rew = null;
		let action = this.actions[a];
		for (dir in this.actions) {
			let x = this.pos.x + dir[0];
			let y = this.pos.y + dir[1];
			if (newx < 0 || newy < 0 || newx >= this.M || newy >= this.N) {
				obs += '1';
				continue;
			}

			let t = this.grid[x][y].sample();
			if (x == this.pos.x && y == this.pos.y) {
				rew = t.reward();
			}

			// TODO sample outcome of actions & new percepts
			// TODO how to update Wall probabilities properly?
			// walls should get immediately falsified -- Dirichlet inappropriate
			let kind = t.constructor.name;
			if (kind == 'Wall') {
				obs += '1';
			} else {
				obs += '0';
			}
		}

		this.percept = { obs: obs, rew: rew };

	}

	update(a, e) {
		return;
	}

	bayesUpdate(a, e) {
		return;
	}

	save() {
		return;
	}

	load() {
		return;
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
