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
		return Math.pow(this.gamma, dfr) * e.rew; // geometric discount
	}
}

class TabularAgent extends Agent {
	constructor(options) {
		super(options);
		this.epsilon = options.epsilon;
		this.alpha = options.alpha;
		this.lifetime = 0;
		this.Q = new QTable(options.optimistic, this.numActions);
		this.tracer = TabularTrace;
		this.last_q = 0;
		this.last_o = options.initial_obs;
	}

	selectAction(e) {
		this.lifetime++;
		if (Math.random() < this.epsilon) {
			return Math.floor(Math.random() * this.numActions);
		}

		return this.argmax(e.obs);
	}

	argmax(obs) {
		let max = Number.NEGATIVE_INFINITY;
		let ties = [];
		let Q;
		for (let a = 0; a < this.numActions; a++) {
			Q = this.Q.get(obs, a);
			if (Q < max) {
				continue;
			} else if (Q > max) {
				ties = [a];
				max = Q;
			} else {
				ties.push(a);
			}
		}

		return Util.randomChoice(ties);
	}

	update(a, e) {
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

class QLearn extends TabularAgent {
	TDUpdate(e) {
		return this.argmax(e.obs);
	}
}

class SARSA extends TabularAgent {
	TDUpdate(e) {
		return this.selectAction(e);
	}
}

class BayesAgent extends Agent {
	constructor(options) {
		super(options);
		this.horizon = options.horizon;
		this.UCBweight = options.UCBweight;
		this.max_reward = options.max_reward;
		this.min_reward = options.min_reward;
		this.samples = options.samples;
		this.information_gain = 0;
		this.tracer = BayesTrace;

		this.model = new BayesMixture(options);
		this.searchTree = new ExpectimaxTree(this, this.model);
	}

	update(a, e) {
		this.model.save();
		this.model.update(a, e);
		this.information_gain = Util.KLDivergence(this.model.weights,
			this.model.saved_weights);
	}

	selectAction(e) {
		this.searchTree.root = new DecisionNode(null, this.searchTree);
		return this.searchTree.bestAction();
	}
}

class FreshAIXI extends BayesAgent {
	constructor(options) {
		super(options);
		this.model = new Model(options.config);
		this.searchTree = new ExpectimaxTree(this, this.model);
	}
}

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
		this.rho;
		this.thompsonSample();
		this.tracer = ThompsonTrace;
	}

	thompsonSample() {
		let idx = Util.sample(this.model.weights);
		this.rho = this.model.modelClass[idx].copy();
		this.rho.bayesUpdate = function () {};

		this.searchTree = new ExpectimaxTree(this, this.rho);
	}

	update(a, e) {
		super.update(a, e);
		this.rho.perform(a);
	}

	selectAction(e) {
		if (this.T % this.horizon == 0) {
			this.thompsonSample();
		} else {
			this.searchTree.root = new DecisionNode(null, this.searchTree);
		}

		this.T++;
		return this.searchTree.bestAction();
	}
}

class DQN extends Agent {

}

class CNC extends Agent {

}

class TorAgent extends BayesAgent{

}

class MDLAgent extends BayesAgent {

}

class OptimisticAIXI extends BayesAgent {

}

class BayesExp extends BayesAgent {

}
