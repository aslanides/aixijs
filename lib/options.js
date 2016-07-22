class Options {
	constructor() {
		this.UCBweight = 1;
		this.horizon = 6;
		this.samples = 400;

		this.alpha = 0.9;
		this.gamma = 0.99;
		this.epsilon = 0.01;
		this.cycles = 100;

		this.min_reward = config.rewards.wall + config.rewards.move;
		this.max_reward = config.rewards.chocolate + config.rewards.move;

		this.modelClass = [];
		this.priorType = 'Uniform';
		this.mu = 0;
	}

	getEnvParams(env) {
		this.M = env.M;
		this.N = env.N;
		this.freqs = env.freqs;
		this.numActions = env.actions.length;
		this.initial_obs = env.generatePercept().obs;
		this.priorType = 'Uniform';
		this.modelClass = env.makeModelClass();
		this.config = env.config;
	}
}
