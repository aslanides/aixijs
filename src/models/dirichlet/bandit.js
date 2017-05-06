class DirichletBandit {
	constructor(options) {
		let A = options.numActions;
		this.numActions = A;
		this.arms = [];
		for (let a = 0; a < A; a++) {
			this.arms.push(new Beta(1, 1));
		}
	}

	bayesUpdate(a, e) {
		let { _, rew } = e;
		this.arms[a].update(rew);
	}

	update(a, e) {
		this.perform(a);
		this.bayesUpdate(a, e);
	}

	perform(a) {
		this.arm = a;
	}

	conditionalDistribution(e) {
		let { _, rew } = e;
		let arm = this.arms[this.action];
		return rew ? arm.mean() : 1 - arm.mean();
	}

	generatePercept() {
		return this.arms[this.action].mean() > 0.5;
	}

	save() {
		this.params = [];
		for (let arm of this.arms) {
			this.params.push({ alpha: arm.alpha, beta: arm.beta });
		}

		this.saved_action = this.action;
	}

	load() {
		for (let a = 0; a < this.numActions; a++) {
			this.arms[a].alpha = this.params[a].alpha;
			this.arms[a].beta = this.params[a].beta;
		}

		this.action = this.saved_action;
	}
}
