class BayesExp extends BayesAgent {
	constructor(options) {
		super(options);
		this.explore = false;
		this.epsilon = options.epsilon;
		this.bayesAgent = new BayesAgent(options);
		this.IGAgent = new KullbackLeiblerKSA(options);
		this.IGAgent.model = this.bayesAgent.model;
		this.model = this.bayesAgent.model;
		this.planner = new ExpectimaxTree(this, this.model, true);
	}

	selectAction(e) {
		if (this.t % this.horizon == 0) {
			let V = this.IGAgent.planner.getValueEstimate();
			this.explore = V > this.epsilon;
		}

		if (this.explore) {
			return this.IGAgent.selectAction(e);
		}

		return this.bayesAgent.selectAction(e);
	}

	update(a, e) {
		this.bayesAgent.update(a, e);
		this.information_gain = this.bayesAgent.information_gain;
	}
}

BayesExp.params = [
	{ field: 'epsilon', value: 0.04 },
];
