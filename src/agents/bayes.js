class BayesAgent extends Agent {
	constructor(options) {
		super(options);
		this.samples = options.samples;
		this.timeout = options.timeout;
		this.horizon = options.horizon;
		this.ucb = options.ucb;
		this.max_reward = options.max_reward;
		this.min_reward = options.min_reward;

		let planCaching = options.plan_caching || true;

		// TODO assert options OK
		this.information_gain = 0;
		this.tracer = options.tracer || BayesTrace;
		this.model = options.model;
		this.planner = new ExpectimaxTree(this, this.model, !planCaching);
	}

	update(a, e) {
		super.update(a, e);
		this.model.save();
		this.model.update(a, e);
		this.information_gain = Util.entropy(this.model.saved_weights) - Util.entropy(this.model.weights);
	}

	selectAction(e) {
		if (this.information_gain) {
			this.planner.reset();
		} else {
			this.planner.prune(this.last_action, e);
		}

		let a = this.planner.bestAction();
		this.plan = this.planner.getPlan();

		return a;
	}
}

BayesAgent.params = [
	{ field: 'horizon', value: 6 },
	{ field: 'samples', value: 600 },
	{ field: 'ucb', value: 0.5 },
	{ field: 'model', value: BayesMixture },
	{ field: 'modelParametrization', value: 'goal' },
];
