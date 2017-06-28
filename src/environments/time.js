class TimeInconsistentEnv extends Environment {
	constructor(options) {
		super(options);
		this.initial_state = 0;
		this.states = [0, 1, 2];

		//TODO move into vis
		this.pos_array = [{ x: 190, y: 60 }, { x: 80, y: 160 }, { x: 300, y: 160 }];
		this.delayed_dispense = 6; //Time at which delay state will return a non-zero reward
		this.delayed_reward = 1000;
		this.instant_reward = 4;

		this.max_reward = this.delayed_reward;
		this.min_reward = 0;
		this.numActions = this.states.length;

		this.actions = new Array(this.states.length);
		this.noop = 0;
		this.current = this.states[0];
		this.delayed_counter = 0; //if this.current = delayed : counter++ else counter = 0
	}

	perform(action) {
		this.current = this.states[action];
		if (this.current == 2) {
			this.delayed_counter++;

			if (this.delayed_counter == this.delayed_dispense) {
				this.reward = this.delayed_reward;
				this.delayed_counter = 0;
			} else {
				this.reward = 0;
			}

		} else {
			this.delayed_counter = 0;
			(this.current == 1) ? this.reward = this.instant_reward : this.reward = 0;
		}
	}

	generatePercept() {
		return {
			obs: this.current,
			rew: this.reward,
		};
	}

	getState() {
		return {
			current: this.current,
			count: this.delayed_counter,
			reward: this.reward,
		};
	}

	save() {
		this.state = {
			current: this.current,
			counter: this.delayed_counter,
			reward: this.reward,
		};
	}

	load() {
		Util.assert(this.state, 'No saved state to load!');
		this.current = this.state.current;
		this.delayed_counter = this.state.counter;
		this.reward = this.state.reward;
	}

	conditionalDistribution(e) {
		//return 1 as we are using AIu for this demo
		return 1;
	}

	makeModel(kind, parametrization) {
		if (parametrization != 'mu') {
			throw `Sorry! This environment doesn't support mixtures.`;
		}

		return new BayesMixture([new this.constructor(this.options)], [1]);
	}
}
