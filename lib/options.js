class Options {
	constructor() {
		// sensible defaults
		this.UCBweight = 1;
		this.horizon = 6;
		this.samples = 400;

		this.alpha = 0.9;
		this.gamma = 0.99;
		this.epsilon = 0.01;
		this.cycles = 100;

		this.optimistic = true;

		this.min_reward = config.rewards.wall + config.rewards.move;
		this.max_reward = config.rewards.chocolate + config.rewards.move;

		this.modelType = null;
		this.modelParametrization = 'goal';
		this.modelClass = [];

		this.priorType = 'Uniform'; // TODO Ockham prior? Mu?
	}

	getDemoParams(dem) {
		this.modelParametrization = dem.modelParametrization || 'goal';
		this.modelType = dem.model;
		this.tracer = dem.tracer;
	}

	getEnvParams(env) {
		this.M = env.M;
		this.N = env.N;
		this.freqs = env.freqs;
		this.numActions = env.actions.length;
		this.initial_obs = env.generatePercept().obs;
		if (this.modelType == BayesMixture) {
			let mod = env.makeModelClass(this.modelParametrization);
			this.modelClass = mod.modelClass;
			this.modelWeights = mod.modelWeights;
		} else if (this.modelType == CTW) {
			this.actionBits = Math.ceil(Math.log2(this.numActions - 1));
			this.rewBits = Math.ceil(Math.log2(this.max_reward - this.min_reward));
			this.obsBits = env.obsBits;
			this.depth = 10;
		}

		this.config = env.config;
	}

	getModel() {
		return new this.modelType(this);
	}
}
