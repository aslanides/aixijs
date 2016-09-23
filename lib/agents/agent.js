class Agent {
	constructor(options) {
		this.gamma = options.gamma;
		this.numActions = options.numActions;
		this.tracer = Trace;
	}

	selectAction(e) {
		return Math.floor(Math.random() * this.numActions);
	}

	update(a, e) {
		return;
	}

	utility(e, dfr) {
		return Math.pow(this.gamma, dfr) * e.rew;
	}
}

Agent.params = [
	{ field: 'cycles', value: 1e3 },
];
