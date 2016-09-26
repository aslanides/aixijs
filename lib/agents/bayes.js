class BayesAgent extends Agent {
	constructor(options) {
		super(options);
		this.horizon = options.horizon;
		this.UCBweight = options.UCBweight;
		this.max_reward = options.max_reward;
		this.min_reward = options.min_reward;
		this.samples = options.samples;
		this.information_gain = 0;
		this.tracer = options.tracer || BayesTrace;
		this.model = options.getModel();
		this.planner = new ExpectimaxTree(this, this.model);
	}

	update(a, e) {
		this.model.save();
		this.model.update(a, e);
		this.information_gain = Util.KLDivergence(this.model.weights,
			this.model.saved_weights);
	}

	selectAction(e) {
		this.planner.reset();
		return this.planner.bestAction();
	}
}

BayesAgent.params = [
	{ field: 'horizon', value: 6 },
	{ field: 'samples', value: 600 },
	{ field: 'ucb', value: 1 },
];
