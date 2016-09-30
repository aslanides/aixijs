class SquareKSA extends BayesAgent {
	constructor(options) {
		super(options);
		this.min_reward = -1;
		this.max_reward = 0;
	}

	utility(e) {
		return -1 * this.model.xi(e);
	}
}

class ShannonKSA extends BayesAgent {
	constructor(options) {
		super(options);
		this.min_reward = 0;
		this.max_reward = 1000; // TODO fix magic no
	}

	utility(e) {
		return -1 * Math.log2(this.model.xi(e));
	}
}

class KullbackLeiblerKSA extends BayesAgent {
	constructor(options) {
		super(options);
		this.max_reward = 0;
		this.min_reward = this.utility();
	}

	utility(e) {
		return -1 * Util.entropy(this.model.weights);
	}
}
