class BasicMDP extends Environment {
	constructor(options) {
		super(options);
		this.states = [];
		this.numActions = 0;
		options._states.forEach((state, idx) => {
			this.states.push({
				index: idx,
				actions: [...state.actions],
			});
			if (state.actions.length > this.numActions) {
				this.numActions = state.actions.length;
			}
		});
		this.initial_state = options._initial_state;
		this.actions = new Array(this.numActions);
		this.current = this.states[options._initial_state];
	}

	perform(action) {
		if (this.current.actions.length > action) {
			let old = this.current;
			let weights = old.actions[action].probabilities;
			let stateIndex =  Util.sample(weights);
			this.current = this.states[stateIndex];
			this.reward = old.actions[action].rewards[stateIndex];
		} else {
			this.reward = Gridworld.rewards.wall;
		}
	}

	generatePercept() {
		return {
			obs: this.current.index,
			rew: this.reward,
		};
	}

	getState() {
		return this.current.index;
	}

	makeModel(type, parametrization) {
		if (type != QTable) {
			throw 'Bad model';
		}

		return new QTable(10, this.numActions);
	}
}
