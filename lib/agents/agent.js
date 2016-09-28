class Agent {
	constructor(options) {
		this.gamma = options.gamma;
		this.numActions = options.numActions;
		this.tracer = Trace;
		this.t = 0;
		this.discount = new options.discount(options.discountParams);
	}

	selectAction(e) {
		return Math.floor(Math.random() * this.numActions);
	}

	update(a, e) {
		this.t++;
	}

	utility(e, dfr) {
		return this.discount.getValue(dfr, this.t) * e.rew;
	}
}

Agent.params = [
	{ field: 'cycles', value: 1e3 },
];
