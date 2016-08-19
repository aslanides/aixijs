class Options {
	constructor() {
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

		this.priorType = 'Uniform';
		this.mu = 0;
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
		this.priorType = 'Uniform';
		if (this.modelType == BayesMixture) {
			this.makeModelClass(env, this.modelParametrization);
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

	makeModelClass(env, kind) {
		let cfg = Util.deepCopy(env.config);
		let C = cfg.M * cfg.N;

		this.modelClass = [];
		this.modelWeights = Util.zeros(C);

		for (let i = 0; i < cfg.M; i++) {
			for (let j = 0; j < cfg.N; j++) {
				if (kind == 'goal') {
					cfg.goals = [
						{
							pos: {
								x: j,
								y: i,
							},
							freq: cfg.goals[0].freq,
							type: cfg.goals[0].type,
						},
					];
				} else if (kind == 'pos') {
					cfg.initial = { x: j, y: i };
				}

				if (cfg.map[i][j] == 'W') {
					this.modelWeights[i * this.N + j] = 0;
				} else {
					this.modelWeights[i * this.N + j] = 1 / C; // default uniform
				}

				this.modelClass.push(new env.constructor(cfg));
			}
		}

		// ensure prior is normalised
		let s = Util.sum(this.modelWeights);
		for (let i = 0; i < C; i++) {
			this.modelWeights[i] /= s;
		}
	}
}
