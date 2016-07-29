class ExpectimaxTree {
	constructor(agent, model) {
		this.model = model;
		this.horizon = agent.horizon;
		this.UCBweight = agent.UCBweight;
		this.max_reward = agent.max_reward;
		this.min_reward = agent.min_reward;
		this.numActions = agent.numActions;
		this.samples = agent.samples;
		this.utility = agent.utility;
		this.gamma = agent.gamma;
		this.root = new DecisionNode(null, this);
	}

	bestAction() {
		this.model.save();
		for (let iter = 0; iter < this.samples; iter++) {
			this.root.sample(this, 0);
			this.model.load();
		}

		return this.root.bestAction(this);
	}

	rollout(horizon, dfr) {
		let reward = 0;
		for (let i = dfr; i < horizon; i++) {
			let action = Math.floor(Math.random() * this.numActions);
			this.model.perform(action);
			let percept = this.model.generatePercept();
			this.model.bayesUpdate(action, percept);
			reward += this.utility(percept, i);
		}

		return reward;
	}
}

class SearchNode {
	constructor() {
		this.visits = 0;
		this.mean = 0;
	}

	toJson() {
		let name;
		if (this.action) {
			name = `a:${this.action} | V:${Util.roundTo(this.mean, 2)}`;
		} else if (this.percept) {
			name = `r:${this.percept.rew} | V:${Util.roundTo(this.mean, 2)}`;
		} else {
			name = 'root';
		}

		let children = [];
		function f(child, key) { children.push(child.toJson());}

		this.children.forEach(f);
		let res = { name: name };
		if (children.length > 0) {
			res.children = children;
		}

		return res;
	}
}

class DecisionNode extends SearchNode {
	constructor(percept, tree) {
		super();
		this.percept = percept;
		this.children = new Array(tree.numActions);
		this.n_children = 0;
		this.U = Util.randInts(tree.numActions);
	}

	addChild(a) {
		this.children[a] = new ChanceNode(a);
	}

	getChild(a) {
		return this.children[a];
	}

	selectAction(tree) {
		let a;
		if (this.n_children != tree.numActions) {
			a = this.U[this.n_children];
			this.addChild(a);
			this.n_children++;
		} else {
			let max = Number.NEGATIVE_INFINITY;
			for (let action = 0; action < tree.numActions; action++) {
				let child = this.getChild(action);
				let normalization = tree.horizon * (tree.max_reward - tree.min_reward);
				let vha = child.mean;
				let value = vha / normalization + tree.UCBweight *
					Math.sqrt(Math.log2(this.visits / child.visits));
				if (value > max) {
					max = value;
					a = action;
				}
			}
		}

		return a;
	}

	sample(tree, dfr) {
		let reward = 0;
		if (dfr > tree.horizon) {
			return 0;
		} else if (this.visits == 0) {
			reward = tree.rollout(tree.horizon, dfr);
		} else {
			let action = this.selectAction(tree);
			reward = this.getChild(action).sample(tree, dfr);
		}

		this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean);
		this.visits++;
		return reward;
	}

	bestAction(tree) {
		let ties = [];
		let max = Number.NEGATIVE_INFINITY;
		let value;
		for (let action = 0; action < tree.numActions; action++) {
			if (!this.getChild(action)) {
				value = 0;
			} else {
				value = this.getChild(action).mean;
			}

			if (value < max) {
				continue;
			} else if (value > max) {
				ties = [action];
				max = value;
			} else {
				ties.push(action);
			}
		}

		return Util.randomChoice(ties);
	}
}

class ChanceNode extends SearchNode {
	constructor(action) {
		super();
		this.children = new Map();
		this.action = action;
	}

	addChild(percept, tree) {
		this.children.set(percept.obs + percept.rew.toString(), new DecisionNode(percept, tree));
	}

	getChild(percept) {
		return this.children.get(percept.obs + percept.rew.toString());
	}

	sample(tree, dfr) {
		let reward = 0;
		if (dfr > tree.horizon) {
			return reward;
		} else {
			tree.model.perform(this.action);
			let percept = tree.model.generatePercept();
			tree.model.bayesUpdate(this.action, percept);
			if (!this.getChild(percept)) {
				this.addChild(percept, tree);
			}

			reward = tree.utility(percept, dfr) + this.getChild(percept).sample(tree, dfr + 1);
		}

		this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean);
		this.visits++;
		return reward;
	}
}
