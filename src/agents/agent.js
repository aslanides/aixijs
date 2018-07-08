class Agent {
	constructor(options) {
		this.numActions = options.numActions;
		this.tracer = Trace;
		this.t = 0;
		this.discount = new options.discount(options.discountParam);
		this.last_action = null;
		this.options = Util.deepCopy(options);
	}

	selectAction(e) {
		return Math.floor(Math.random() * this.numActions);
	}

	update(a, e) {
		this.last_action = a;
		this.t++;
	}

	reward(e, dfr) {
		return this.discount(dfr, this.t) * this.utility(e);
	}

	utility(e) {
		return e.rew;
	}
}

Agent.params = [
	{ field: 'steps', value: 2e2 },
	{ field: 'discount', value: GeometricDiscount },
	{ field: 'discountParams', value: { gamma: 0.99 } },
];
