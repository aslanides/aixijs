class ThompsonAgent extends BayesAgent {
	constructor(options) {
		super(options);
		this.thompsonSample();
		this.tracer = ThompsonTrace;
	}

	thompsonSample() {
		var idx = Util.sample(this.model.weights);
		this.rho = this.model.modelClass[idx].copy();
		this.rho.bayesUpdate = function () {};

		this.planner = new ExpectimaxTree(this, this.rho);
	}

	update(a, e) {
		super.update(a, e);
		this.rho.perform(a);
	}

	selectAction(e) {
		if (this.t % this.horizon == 0) {
			this.thompsonSample();
		} else {
			this.planner.reset();
		}

		return this.planner.bestAction();
	}
}
