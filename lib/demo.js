const demo = {
	ui: new UI(),

	run() {
		this.options = this.ui.getOptions();
		this.config = this.ui.getConfig(this.dem);
		if (!this.options || !this.dem) return;
		if (this.vis) this.vis.remove();

		this.env = new this.dem.env(this.config);

		this.options.getDemoParams(this.dem);
		this.options.getEnvParams(this.env);

		this.agent = new this.dem.agent(this.options);
		this.trace = new this.agent.tracer(this.options.cycles);
		this.plots = this.trace.makePlots();

		let update = trace => {
			for (let p of this.plots) {
				p.dataUpdate(trace);
			}
		};

		let callback = _ => {
			this.ui.end();
			if (this.dem.vis) {
				this.vis = new this.dem.vis(this.env, this.trace, this.ui);
				this.vis.reset();
			}

			this.cancel = false;
			let frames = this.trace.iter;
			let second = Util.roundTo((performance.now() - this.t0) / 1000, 4);
			let fps = Util.roundTo(frames / second, 2);
			console.log(`${frames} cycles, ${second} seconds (${fps} fps)`);
		};

		this.ui.start();
		this.t0 = performance.now();
		this.simulate(update, callback);
	},

	simulate(update, callback) {
		let trace = this.trace;
		let agent = this.agent;
		let env = this.env;

		let e = env.generatePercept();
		let a = env.noop;

		trace.log(agent, env, a, e);
		agent.update(a, e);

		let loop = _ => {
			if (trace.iter >= trace.t || this.cancel) {
				callback();
				return;
			}

			trace.log(agent, env, a, e);
			a = agent.selectAction(e);
			env.perform(a);
			e = env.generatePercept();
			agent.update(a, e);

			update(trace);

			setTimeout(loop, 0);
		};

		loop();

	},

	stop() {
		this.cancel = true;
	},

	new() {
		if (this.vis) this.vis.pause();

		let e = this.ui.getElementById('demo_select');
		let name = e.options[e.selectedIndex].value;
		let dem;
		for (let d in demos) {
			if (demos[d].name == name) {
				dem = demos[d];
				break;
			}
		}

		Util.assert(dem);
		this.dem = dem;
		this.ui.showAgentParams(dem.params);
		this.ui.clearExplanations();
		if (!dem.exps) {
			return;
		}

		for (let exp of dem.exps) {
			this.ui.showExplanation(exp);
		}
	},

	experiment(runs) {
		rewardTraces = [];
		for (let i = 0; i < runs; i++) {
			this.run(i);
			rewardTraces.push(this.trace.rewards);
		}

		return rewardTraces;
	},
};

const demos = {
	aixi_dispenser: {
		name: 'MC-AIXI vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	aixi_dispenser2: {
		name: 'MC-AIXI vs DispenserGrid2',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser3,
		modelParametrization: 'pos',
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	aixi_episodic: {
		name: 'MC-AIXI vs EpisodicGrid',
		agent: BayesAgent,
		env: EpisodicGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.episodic1,
		params: {
			horizon: 10,
			samples: 1200,
			ucb: 1,
			cycles: 2e2,
		},
	},
	dirichletaixi_dispenser: {
		name: 'MC-AIXI-Dirichlet vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 100,
		},
	},
	ctwaixi_dispenser: {
		name: 'MC-AIXI-CTW vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: CTW,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 100,
			ucb: 1,
			cycles: 2e1,
		},
	},
	thompson_dispenser: {
		name: 'Thompson Sampling vs DispenserGrid',
		agent: ThompsonAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 10,
			samples: 1200,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		'thompson',
		],
	},
	squareKSA_dispenser: {
		name: 'Square KSA vs DispenserGrid',
		agent: SquareKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
		},
		cycles: 2e2,
		exps: [
		'dispenser_bayes',
		],
	},
	shannonKSA_dispenser: {
		name: 'Shannon KSA vs DispenserGrid',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	KLKSA_dispenser: {
		name: 'Kullback-Leibler KSA vs DispenserGrid',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	KLKSA_dirichlet_dispenser: {
		name: 'KL-KSA-Dirichlet vs DispenserGrid',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	BayesExp_dispenser: {
		name: 'BayesExp vs DispenserGrid',
		agent: BayesExp,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: config.environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
			epsilon: 0.1,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	aixi_ipd: {
		name: `AIXI vs Iterated Prisoner's Dilemma`,
		agent: BayesAgent,
		env: IteratedPrisonersDilemma,
		model: BayesMixture,
		trace: Trace,
		vis: null,
		config: config.environments.prisoners_dilemma,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
			opponent: null,
		},
	},
	ql_episodic: {
		name: 'Q-Learning vs DispenserGrid',
		agent: QLearn,
		env: SimpleDispenserGrid,
		vis: TabularGridVis,
		config: config.environments.dispenser1,
		params: {
			alpha: 0.9,
			gamma: 0.99,
			epsilon: 0.01,
			cycles: 2e2,
		},
	},
	ql_bandit: {
		name: 'Q-Learning vs Gaussian 2-armed bandit',
		agent: QLearn,
		env: Bandit,
		vis: BanditVis,
		config: config.environments.gaussbandit,
		params: {
			alpha: 0.9,
			gamma: 0.99,
			epsilon: 0.05,
			cycles: 1e3,
		},
	},
	ql_mdp: {
		name: 'Q-Learning vs simple MDP',
		agent: QLearn,
		env: BasicMDP,
		vis: MDPVis,
		config: config.environments.mdp,
		params: {
			alpha: 0.9,
			gamma: 0.99,
			epsilon: 0.05,
			cycles: 1e3,
		},
	},
	puckworld: {
		name: 'DQN vs Puckworld',
		agent: DQN,
		env: Puckworld,
		vis: PuckworldVis,
		params: {
			cycles: 3e3,
		},
	},
};
