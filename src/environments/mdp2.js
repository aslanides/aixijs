class MDP extends Environment {
	constructor(options) {
		super(options);
		this.numActions = options.numActions;
		this.numStates = options.numStates;
		this.groups = options.groups;

		this.noop = 0;
		this.state = 0;
		this.last_state = 0;
		this.last_action = 0;

		this.transitions = options.transitions;
		this.rewards = options.rewards;

		this.min_reward = Number.POSITIVE_INFINITY;
		this.max_reward = Number.NEGATIVE_INFINITY;

		var R = this.rewards;
		for (var s = 0; s < this.numStates; s++) {
			for (var a = 0; a < this.numActions; a++) {
				if (R[s][a] < this.min_reward) {
					this.min_reward = R[s][a];
				}

				if (R[s][a] > this.max_reward) {
					this.max_reward = R[s][a];
				}
			}
		}
	}

	perform(a) {
		var s = this.state;
		var P = this.transitions[a][s];
		var s_ = Util.sample(P);
		this.last_state = s;
		this.last_action = a;
		this.state = s_;
		this.reward = this.rewards[s][a];
	}

	generatePercept() {
		return {
			obs: this.state,
			rew: this.reward,
		};
	}

	getState() {
		return this.state;
	}

	conditionalDistribution(e) {
		var s = this.last_state;
		var a = this.last_action;
		var s_ = e.obs;

		if (e.rew != this.rewards[s][a]) {
			return 0;
		}

		return this.transitions[a][s][s_]; // :D
	}

	makeModel(type, parametrization) {
		if (parametrization == 'mu') {
			var options = Util.deepCopy(this.options);
			var modelClass = [new this.constructor(options)];
			var weights = [1];
			return new BayesMixture(modelClass, weights);
		}

		if (type == QTable) {
			throw 'Bad model';
		}

		return new QTable(10, this.numActions);
	}

	save() {
		this.saved_state = this.state;
	}

	load() {
		this.state = this.saved_state;
	}
}

class HeavenHell extends MDP {
	// TODO build model class
}
