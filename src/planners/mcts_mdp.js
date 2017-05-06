class MDPExpectimaxTree {
	constructor(agent, model) {
		// solves value iteration on MDPs with general discount functions
		// requires AImu on MDP
		this.model = model;
		this.horizon = agent.horizon;
		this.ucb = agent.ucb;
		this.max_reward = agent.max_reward;
		this.min_reward = agent.min_reward;
		this.rew_range = this.max_reward - this.min_reward;
		this.numActions = agent.numActions;
		this.samples = agent.samples;
		this.gamma = agent.gamma;
		this.agent = agent; // TODO fix
		if (nocaching) {
			this.prune = this.reset;
		}

		this.numStates = model.numStates;
		this.Q = [];
		for (var s = 0; s < this.numStates; s++) {
			this.Q.push(Util.zeros(this.numActions));
		}

		this.reset();
	}

	getValueEstimate() {
		if (!this.sampled) {
			this.model.save();
			for (var iter = 0; iter < this.samples; iter++) {
				this.root.sample(this, 0);
				this.model.load();
			}

			this.sampled = true;
		}

		return (this.root.mean / this.horizon - this.min_reward) / this.rew_range;
	}

	bestAction() {
		this.getValueEstimate();

		return Util.argmax(this.root, (n, a) => {
			var child = n.getChild(a);
			return child ? child.mean : 0;
		}, this.numActions);
	}

	getPlan() {
		var current = this.root;
		var ret = [];
		while (current) {
			var a = Util.argmax(current, (n, a) => {
				var child = n.getChild(a);
				return child ? child.mean : 0;
			}, this.numActions);

			ret.push(a);
			var chanceNode = current.getChild(a);

			if (!chanceNode) {
				return ret;
			}

			var child = null;
			var maxVisits = 0;
			for (var [key, val] of chanceNode.children) {
				if (val.visits > maxVisits) {
					child = val; //No tie-breaking for now
					maxVisits = val.visits;
				}
			}

			current = child;
		}

		return ret;
	}

	rollout(horizon, dfr) {
		var reward = 0;
		for (var i = dfr; i < horizon; i++) {
			var action = Math.floor(Math.random() * this.numActions);
			this.model.perform(action);
			var e = this.model.generatePercept();
			this.model.bayesUpdate(action, e);
			reward += this.agent.reward(e, i);
		}

		return reward;
	}

	reset() {
		var agent = this.agent;
		this.rew_range = agent.discount(0, agent.t) * (agent.max_reward - agent.min_reward);
		this.root = new DecisionNode(null, this);
		this.sampled = false;
	}

	prune(a, e) {
		var cn = this.root.getChild(a);
		if (!cn) {
			return this.reset();
		}

		this.root = cn.getChild(e, this);
		if (!this.root) {
			return this.reset();
		}

		this.sampled = false;
	}
}

class DecisionNode {
	constructor(e, tree) {
		this.visits = 0;
		this.mean = 0;
		this.e = e;
		this.children = new Array(tree.numActions);
		this.n_children = 0;
		this.U = Util.randInts(tree.numActions);
	}

	addChild(a, tree) {
		tree.children[this.e.obs][a] = new ChanceNode(a); // TODO fix
	}

	getChild(a, tree) {
		return this.children[a];
	}

	selectAction(tree) {
		var a;
		if (this.n_children != tree.numActions) {
			a = this.U[this.n_children];
			this.addChild(a);
			this.n_children++;
		} else {
			var max = Number.NEGATIVE_INFINITY;
			for (var action = 0, A = tree.numActions; action < A; action++) {
				var child = this.getChild(action);
				var normalization = tree.horizon * tree.rew_range;
				var value = child.mean / normalization + tree.ucb *
					Math.sqrt(Math.log2(this.visits) / child.visits);
				if (value > max) {
					max = value;
					a = action;
				}
			}
		}

		return a;
	}

	sample(tree, dfr) {
		var reward = 0;
		if (dfr > tree.horizon) {
			return 0;
		} else if (this.visits == 0) {
			reward = tree.rollout(tree.horizon, dfr);
		} else {
			var action = this.selectAction(tree);
			reward = this.getChild(action).sample(tree, dfr);
		}

		this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean);
		this.visits++;
		return reward;
	}
}

class ChanceNode  {
	constructor(action) {
		this.visits = 0;
		this.mean = 0;
		this.children = new Map();
		this.action = action;
	}

	addChild(e, tree) {
		tree.set(e.obs, new DecisionNode(e, tree));
	}

	getChild(e, tree) {
		return tree.get(e.obs); // TODO fix
	}

	sample(tree, dfr) {
		var reward = 0;
		if (dfr > tree.horizon) {
			return reward;
		} else {
			tree.model.perform(this.action);
			var e = tree.model.generatePercept();
			tree.model.bayesUpdate(this.action, e);
			if (!this.getChild(e, tree)) {
				this.addChild(e, tree);
			}

			reward = tree.agent.reward(e, dfr) + this.getChild(e, tree).sample(tree, dfr + 1);
		}

		this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean);
		this.visits++;
		return reward;
	}
}
