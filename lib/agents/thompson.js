class ThompsonAgent extends BayesAgent {
	constructor(options) {
		super(options);
		this.T = 1;
		this.thompsonSample();
		this.tracer = ThompsonTrace;
	}

	thompsonSample() {
		let idx = Util.sample(this.model.weights);
		this.rho = this.model.modelClass[idx].copy();
		this.rho.bayesUpdate = function () {};

		this.planner = new ExpectimaxTree(this, this.rho);
	}

	update(a, e) {
		super.update(a, e);
		this.rho.perform(a);
	}

	selectAction(e) {
		if (this.T % this.horizon == 0) {
			this.thompsonSample();
		} else {
			this.planner.reset();
		}

		this.T++;
		return this.planner.bestAction();
	}
}
