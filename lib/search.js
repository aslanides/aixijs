class ExpectimaxTree {
	constructor(agent, model) {
		this.model = model;
		this.horizon = agent.horizon;
		this.UCBweight = agent.UCBweight;
		this.max_reward = agent.max_reward;
		this.min_reward = agent.min_reward;
		this.rew_range = this.max_reward - this.min_reward;
		this.numActions = agent.numActions;
		this.samples = agent.samples;
		this.gamma = agent.gamma;
		this.agent = agent;
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

	getPlan() {
		//get best action from decision node and add to list
		let current_node = this.root;
		let ret = [];
		while (current_node != null){
			//push action with highest value
			ret.push(current_node.bestAction(this));
			//Set chance_node as the node corresponding to this action
			let chance_node = current_node.getChild(current_node.bestAction(this))
			//find new decision node by getting node with max visits
			let max_child = null;
			let max_value = 0;
			if (chance_node == undefined){
				return ret;
			}
			for (let [key, child] of chance_node.children) {
				if (child.visits > max_value){
						max_child = child; //No tie-breaking for now
						max_value = child.visits;
					}
			}
			current_node = max_child
		}
		console.log(ret)
		return ret;
	}

	rollout(horizon, dfr) {
		let reward = 0;
		for (let i = dfr; i < horizon; i++) {
			let action = Math.floor(Math.random() * this.numActions);
			this.model.perform(action);
			let percept = this.model.generatePercept();
			this.model.bayesUpdate(action, percept);
			reward += this.agent.utility(percept, i);
		}

		return reward;
	}
}

class DecisionNode {
	constructor(percept, tree) {
		this.visits = 0;
		this.mean = 0;
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
				let normalization = tree.horizon * tree.rew_range;
				let value = child.mean / normalization + tree.UCBweight *
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

class ChanceNode  {
	constructor(action) {
		this.visits = 0;
		this.mean = 0;
		this.children = new Map();
		this.action = action;
	}

	addChild(percept, tree) {
		this.children.set(percept.obs * tree.rew_range + percept.rew, new DecisionNode(percept, tree));
	}

	getChild(percept, tree) {
		return this.children.get(percept.obs * tree.rew_range + percept.rew);
	}

	sample(tree, dfr) {
		let reward = 0;
		if (dfr > tree.horizon) {
			return reward;
		} else {
			tree.model.perform(this.action);
			let percept = tree.model.generatePercept();
			tree.model.bayesUpdate(this.action, percept);
			if (!this.getChild(percept, tree)) {
				this.addChild(percept, tree);
			}

			reward = tree.agent.utility(percept, dfr) + this.getChild(percept, tree).sample(tree, dfr + 1);
		}

		this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean);
		this.visits++;
		return reward;
	}
}
