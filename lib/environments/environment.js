class Environment {
	constructor(config) {
		this.reward = 0;
		this.config = Util.deepCopy(config);
		this.plots = [];
	}

	perform(action) {
		throw 'Not implemented!';
	}

	generatePercept() {
		throw 'Not implemented!';
	}

	conditionalDistribution(e) {
		throw 'Not implemented!';
	}

	save() {
		throw 'Not implemented!';
	}

	load() {
		throw 'Not implemented!';
	}

	getState() {
		throw 'Not implemented!';
	}
}
