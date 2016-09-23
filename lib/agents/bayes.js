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

class SquareKSA extends BayesAgent {
	utility(percept) {
		return -1 * this.model.xi(percept);
	}
}

class ShannonKSA extends BayesAgent {
	utility(percept) {
		return -1 * Math.log2(this.model.xi(percept));
	}
}

class KullbackLeiblerKSA extends BayesAgent {
	utility(percept) {
		return -1 * Util.entropy(this.model.weights);
	}
}

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

class BayesExp extends BayesAgent {
	constructor(options) {
		super(options);
		this.T = 1;
		this.explore = false;
		this.epsilon = options.epsilon;
		this.bayesAgent = new BayesAgent(options);
		this.IGAgent = new KullbackLeiblerKSA(options);
		this.IGAgent.model = this.bayesAgent.model;
		this.model = this.bayesAgent.model;
	}

	selectAction(e) {
		if (this.T % this.horizon == 0) {
			let V = this.IGAgent.planner.getValueEstimate();
			this.explore = V > this.epsilon;
		}

		this.T++;
		return this.explore ? this.IGAgent.selectAction(e) : this.bayesAgent.selectAction(e);
	}

	update(a, e) {
		this.bayesAgent.update(a, e);
		this.information_gain = this.bayesAgent.information_gain;
	}
}

BayesExp.params = [
	{ field: 'epsilon', value: 0.01 },
];

class MDLAgent extends BayesAgent {
	constructor(options) {
		super(options);
		this.tracer = ThompsonTrace;
		for (let i = 0; i < this.model.modelClass.length; i++) {
			this.model.modelClass[i].idx = i;
		}

		let len = model => {
			let lm = model.config.toString().length;
			let li = (model.idx >>> 0).toString(2).length;

			return lm + li;
		};

		this.model.modelClass.sort((m, n) => len(m) - len(n));
		let w = [...this.model.weights];
		for (let i = 0; i < this.model.modelClass.length; i++) {
			let m = this.model.modelClass[i];
			w[i] = this.model.weights[m.idx];
		}

		this.model.weights = w;
		this.idx = 0;
		this.rho = this.model.modelClass[this.idx].copy();
		this.rho.bayesUpdate = function () {};
	}

	update(a, e) {
		super.update(a, e);
		if (this.model.weights[this.idx] != 0) {
			return;
		}

		for (; this.idx < this.model.modelClass.length; this.idx++) {
			if (this.model.weights[this.idx] != 0) {
				this.rho = this.model.modelClass[this.idx].copy();
				this.rho.bayesUpdate = function () {};

				this.planner = new ExpectimaxTree(this, this.rho);
				return;
			}
		}

		// we shouldn't get here
		throw 'Cromwell violation! Agent is in Bayes Hell!';
	}
}

class TorAgent extends MDLAgent {

}

class OptimisticAIXI extends BayesAgent {

}
