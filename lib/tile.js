class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.reward = function () {return Gridworld.rewards.empty;};

		this.legal = true;
		this.color = GridVisualization.colors.empty;
		this.info = [];
		this.obs = null; // gets filled out on construction
		this.symbol = 0; // what it looks like from afar
		this.connexions = new Array();
	}
}

class Wall extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return Gridworld.rewards.wall;};

		this.legal = false;
		this.color = GridVisualization.colors.wall;
		this.symbol = 1;
	}
}

class Chocolate extends Tile {
	constructor(x, y) {
		super(x, y);
		this.reward = function () {return Gridworld.rewards.chocolate;};

		this.color = GridVisualization.colors.chocolate;
	}
}

class Dispenser extends Tile {
	constructor(x, y, freq) {
		super(x, y);
		this.freq = freq;
		this.color = GridVisualization.colors.dispenser;
		this.reward = function () {
			return Math.random() < this.freq ? Gridworld.rewards.chocolate : Gridworld.rewards.empty;
		};
	}
}

class Trap extends Tile {
	constructor(x, y) {
		super(x, y);
		this.color = GridVisualization.colors.trap;
		this.reward = function () {
			return Gridworld.rewards.wall;
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
		let idx = Util.sample(p);

		return this.children[idx];
	}

	update(bitvec) {
		this.pr.update(bitvec);
	}

	prob(i) {
		return this.pr.mean(i);
	}
}
