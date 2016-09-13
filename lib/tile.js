class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.reward = function () {return config.rewards.empty;};

		this.legal = true;
		this.color = config.colors.empty;
		this.info = [];
		this.obs = null; // gets filled out on construction
		this.symbol = 0; // what it looks like from afar
		this.connexions = new Array();
	}

	static new(i, j, info, type) {
		let tile;
		if (type == config.map_symbols.empty) {
			tile = new Tile(i, j);
		} else if (type == config.map_symbols.wall) {
			tile = new Wall(i, j);
		} else if (type == config.map_symbols.chocolate) {
			tile = new Chocolate(i, j);
		} else if (type == config.map_symbols.dispenser) {
			tile = new Dispenser(i, j, info);
		} else if (type == config.map_symbols.trap) {
			tile = new Trap(i,j);
		} else {
			throw `Error: unknown Tile type: ${type}.`;
		}

		return tile;
	}
}

class Wall extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return config.rewards.wall;};

		this.legal = false;
		this.color = config.colors.wall;
		this.symbol = 1;
	}
}

class Chocolate extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return config.rewards.chocolate;};

		this.color = config.colors.chocolate;
	}
}

class Dispenser extends Tile {
	constructor(x, y, freq) {
		super(x, y);
		this.freq = freq;
		this.color = config.colors.dispenser;
		this.reward = function () {
			return Math.random() < this.freq ? config.rewards.chocolate : config.rewards.empty;
		};
	}
}

class Trap extends Tile {
	constructor(x, y) {
		super(x, y);
		this.color = config.colors.trap;
		this.reward = function () {
			return config.rewards.wall;
		};
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
		let kek = Util.sample(p);

		return this.children[kek];
	}

	update(bitvec) {
		this.pr.update(bitvec);
	}

	prob(i) {
		return this.pr.mean(i);
	}
}
