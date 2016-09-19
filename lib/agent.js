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
	}

	selectAction(e) {
		this.lifetime++;
		if (Math.random() < this.epsilon) {
			return Util.randi(0, this.numActions);
		}

		return Util.argmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions);
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
		return Util.argmax(this.Q, (q, a) => q.get(e.obs, a), this.numActions);
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

class MDLAgent extends BayesAgent {
	constructor(options) {
		super(options);
		for (let i = 0; i < this.model.modelClass.length; i++) {
			this.model.modelClass[i].idx = i;
		}

		let len = model => {
			let lm = model.constructor.toString().length;
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
	}

	update(a, e) {
		super.update(a, e);
		if (this.model.weights[this.idx] != 0) {
			return;
		}

		for (; this.idx < this.model.modelClass.length; this.idx++) {
			if (this.model.weights[this.idx] != 0) {
				let rho = this.model.modelClass[this.idx];
				this.planner = new ExpectimaxTree(this, rho);
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

class DQN extends Agent {
	constructor(options) {
		super(options);
		this.epsilon = options.epsilon; // TODO try defaults agent-side, not options-side
		this.alpha = options.alpha;

		this.experience_freq = options.experience_freq || 25;
		this.experience_size = options.experience_size || 5000;
		this.steps_per_iter = options.steps_per_iter || 10;
		this.tderror_clamp = options.tderror_clamp || 1;

		this.num_hidden_units = options.num_hidden_units || 100;
		this.input_space_size = options.input_space_size || 8; // TODO generalize

		this.nh = this.num_hidden_units;
		this.na = this.numActions;
		this.ns = this.input_space_size;

		this.net = new Net();
		this.net.addLayer(
			Matrix.rand(this.nh, this.ns, 0, 0.01),
			new Matrix(this.nh, 1)
		);
		this.net.addLayer(
			Matrix.rand(this.na, this.nh, 0, 0.01),
			new Matrix(this.na, 1)
		);

		this.exp = []; // experience
		this.expi = 0; // where to insert

		this.T = 0;

		this.s = null;
		this.a = null;
		this.r = null;
		this.s1 = null;
		this.a1 = null;

		this.tderror = 0;
		$.getJSON('lib/dqn.json', data =>
			this.fromJSON(data)
		);
	}

	toJSON() {
		var j = {};
		j.nh = this.nh;
		j.ns = this.ns;
		j.na = this.na;
		j.net = this.net.toJSON();
		return j;
	}

	fromJSON(j) {
		this.nh = j.nh;
		this.ns = j.ns;
		this.na = j.na;
		this.net = new Net();
		this.net.fromJSON(j.net);
	}

	forwardQ(s, backprop) {
		let net = this.net;
		let G = new Graph(backprop);
		let a1mat = G.add(G.mul(net.edges[0], s), net.biases[0]);
		let h1mat = G.tanh(a1mat);
		let a2mat = G.add(G.mul(net.edges[1], h1mat), net.biases[1]);
		this.G = G; // back this up. Kind of hacky isn't it
		return a2mat;
	}

	selectAction(e) {
		let s = new Matrix(this.ns, 1);
		s.setFrom(e.obs);

		// epsilon greedy
		let a = null;
		if (Math.random() < this.epsilon) {
			a = Util.randi(0, this.na);
		} else {
			let out = this.forwardQ(s, false);
			a = Util.argmax(out.w, (w, a) => w[a], this.numActions);
		}

		this.s = this.s1;
		this.a = this.a1;
		this.s1 = s;
		this.a1 = a;

		return a;
	}

	update(a, e) {
		if (this.alpha == 0) {
			return;
		}

		if (!this.r) {
			this.r = e.rew;
			return;
		}

		this.tderror = this.learnFromTuple(this.s, this.a, this.r, this.s1, this.a1);

		// decide if we should keep this experience in the replay
		if (this.T % this.experience_freq === 0) {
			this.exp[this.expi] = [this.s, this.a, this.r, this.s1, this.a1];
			this.expi += 1;
			if (this.expi > this.experience_size) { this.expi = 0; } // roll over when we run out
		}

		// sample some additional experience from replay memory and learn from it
		for (let k = 0; k < this.steps_per_iter; k++) {
			let ri = Util.randi(0, this.exp.length); // todo: priority sweeps?
			let e = this.exp[ri];
			this.learnFromTuple(e[0], e[1], e[2], e[3], e[4]);
		}

		this.T += 1;
		this.r = e.rew;
	}

	learnFromTuple(s0, a0, r0, s1, a1) {
		// want: Q(s,a) = r + gamma * max_a' Q(s',a')

		// compute the target Q value
		let tmat = this.forwardQ(s1, false);
		let qmax = r0 + this.gamma * tmat.w[Util.argmax(tmat.w, (w, a) => w[a], this.numActions)];

		// now predict
		let pred = this.forwardQ(s0, true);

		let tderror = pred.w[a0] - qmax;
		let clamp = this.tderror_clamp;
		if (Math.abs(tderror) > clamp) {  // huber loss to robustify
			if (tderror > clamp) tderror = clamp;
			if (tderror < -clamp) tderror = -clamp;
		}

		pred.dw[a0] = tderror;
		this.G.backward(); // compute gradients on net params

		this.net.update(this.alpha);

		return tderror;
	}

}
