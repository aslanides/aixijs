class MDP extends Environment {
	constructor(options) {
		super(options);
		this.numActions = options.numActions;
		this.numStates = options.numStates;
		this.initial_state = options._initial_state;
		this.noop = 0;
		this.min_reward = options.min_reward;
		this.max_reward = options.max_reward;
		this.state = 0;

		this.transitions = options.transitions;
		this.rewards = options.rewards;

		this.min_reward = Number.POSITIVE_INFINITY;
		this.max_reward = Number.NEGATIVE_INFINITY;

		let R = this.rewards;
		for (let s = 0; s < this.numStates; s++) {
			for (let a = 0; a < this.numActions; a++) {
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
		let s = this.state;
		let P = this.transitions[a][s];
		let s_ = Util.sample(P);
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
		return 1; // TODO fix
	}

	makeModel(type, parametrization) {
		if (parametrization == 'mu') {
			let options = Util.deepCopy(this.options);
			let modelClass = [new this.constructor(options)];
			let weights = [1];
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
