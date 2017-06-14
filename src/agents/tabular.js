class TabularAgent extends Agent {
	constructor(options) {
		super(options);
		this.epsilon = options.epsilon;
		this.alpha = options.alpha;
		this.gamma = options.gamma;
		this.lifetime = 0;
		this.Q = options.model;
		this.tracer = options._tracer || TabularTrace;
		this.last_q = 0;
	}

	selectAction(e) {
		this.lifetime++;
		if (Math.random() < this.epsilon) {
			return Util.randi(0, this.numActions);
		}

		return Util.argmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions);
	}

	update(a, e) {
		super.update(a, e);
		let old = this.Q.get(this.last_o, a);
		let Q = old +
			this.alpha * (
				e.rew + this.gamma * this.Q.get(e.obs, this.TDUpdate(e)) - old
			);
		this.Q.set(this.last_o, a, Q);
		this.last_q = Q;
		this.last_o = e.obs;
	}

	TDUpdate(e) {
		throw 'not implemented';
	}
}

TabularAgent.params = [
	{ field: 'alpha', value: '0.9' },
	{ field: 'gamma', value: '0.99' },
	{ field: 'epsilon', value: '0.05' },
	{ field: 'model', value: QTable },
];

class QLearn extends TabularAgent {
	TDUpdate(e) {
		return Util.argmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions);
	}
}

class SARSA extends TabularAgent {
	TDUpdate(e) {
		return this.selectAction(e);
	}
}
