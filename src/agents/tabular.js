class TabularAgent extends Agent {
	constructor(options) {
		super(options);
		this.epsilon = options.epsilon;
		this.alpha = options.alpha;
		this.gamma = options.gamma;
		this.lifetime = 0;
		this.Q = options.model;
		this.last_q = 0;
		this.tracer = options._tracer || TabularTrace;
		if (options._random) {
			Math.seedrandom();
		}
	}

	bestAction(e) {
		return Util.argmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions);
	}

	selectAction(e) {
		if (Math.random() < this.epsilon) {
			return Util.randi(0, this.numActions);
		}
		return this.bestAction(e);
	}

	update(a, e) {
		super.update(a, e);
		this.lifetime++; // moved here from selectAction to avoid double-counting
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
		return this.bestAction(e);
	}
}

class SARSA extends TabularAgent {
	TDUpdate(e) {
		return this.selectAction(e);
	}
}

class SoftQLearn extends TabularAgent {
	constructor(options) {
		super(options);
		this.beta = options.beta;
	}

	selectAction(e) {
		return Util.argsoftmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions, this.beta);
	}

	TDUpdate(e) {
		return this.bestAction(e);
	}
}

class Quantiliser extends TabularAgent {
	constructor(options) {
		super(options);
		this.explored = false;
		this.final_selected = false;
		this.final = false;
		this.delta = options.delta;
		this.V = new Object();
		this.visits = new Object();
		this.num_visited = [0];
		this.window = 100;
	}

	selectAction(e) {
		if ((this.explored == true) && (this.final_selected == false)) {
			this.final = this.selectFinalState();
			// console.log('final state', this.final);
			this.final_selected = true;
		}
		if ((this.final_selected == true) && (e.obs == this.final)) {
			return this.numActions - 1; // last action, which is the no-op
		} else {
			return Util.randi(0, this.numActions);
		}
	}

	TDUpdate(e) {
		return this.bestAction(e);
	}

	update(a, e) {
		this.lifetime++;
		let len = this.num_visited.length;
		if (e.obs in this.visits) {
			this.visits[e.obs]++;
			this.V[e.obs] += e.rew;
			this.num_visited.push(this.num_visited[len - 1]);
		} else {
			this.visits[e.obs] = 1;
			this.V[e.obs] = e.rew;
			this.num_visited.push(this.num_visited[len - 1] + 1);
		}
		if ((len > this.window) && (this.num_visited[len] == this.num_visited[len - this.window])) {
			this.explored = true;
		}
	}

	selectFinalState() {
		let vals = [];
		for (var obs in this.V) {
			if (this.V[obs] / this.visits[obs] >= this.delta) {
				vals.push(obs);
				// console.log('state', obs, 'has average reward', this.V[obs] / this.visits[obs]);
			}
		}
		return Util.randomChoice(vals);
	}
}
