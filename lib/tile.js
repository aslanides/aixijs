class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.reward = function () {return config.rewards.empty;};

		this.legal = true;
		this.color = config.colors.empty;
		this.info = [];
		this.obs = '';

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
		this.percept = 1;
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
		this.chocolate = false;
		this.reward = function () {
			let rew = this.chocolate ? config.rewards.chocolate : config.rewards.empty;
			this.chocolate = false;
			return rew;
		};
	}

	dispense() {
		if (this.chocolate) {
			return;
		}

		if (Math.random() < this.freq) {
			this.chocolate = true;
		}
	}
}
