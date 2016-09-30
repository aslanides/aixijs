class Bandit extends Environment {
	constructor(options) {
		super(options);
		this.actions = [];
		for (let param of options._params) {
			this.actions.push(new options.dist(param));
		}

		this.arm = 0;
	}

	perform(action) {
		this.arm = action;
	}

	generatePercept() {
		return {
			obs: this.arm,
			rew: this.actions[this.arm].sample(),
		};
	}

	conditionalDistribution(e) {
		return this.actions[this.arm].prob();
	}

	getState() {
		return this.arm;
	}

	makeModel(kind, parametrization) {
		return new QTable(10, this.actions.length);
	}
}
