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
		demos = [];
		for (let i = 0; i < runs; i++) {
			this.run(i);
			demos.push(this);
		}

		return demos;
	},
};

const demos = {
	aixi_dispenser: {
		name: 'MC-AIXI vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: environments.dispenser1,
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
		config: environments.dispenser2,
		modelParametrization: 'pos',
		params: {
			horizon: 12,
			samples: 1500,
			ucb: 1,
			cycles: 1e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	aixi_dispenser3: {
		name: 'MC-AIXI vs DispenserGrid (maze)',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: environments.dispenser1,
		modelParametrization: 'maze',
		params: {
			horizon: 12,
			samples: 1500,
			ucb: 1,
			cycles: 1e2,
		},
	},
	dirichletaixi_dispenser: {
		name: 'MC-AIXI-Dirichlet vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: environments.dispenser1,
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 100,
		},
	},
	dirichletaixi_dispenser2: {
		name: 'MC-AIXI-Dirichlet vs DispenserGrid2',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: environments.dispenser2,
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
		config: environments.dispenser1,
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
		config: environments.dispenser1,
		params: {
			horizon: 10,
			samples: 1200,
			ucb: 1,
			cycles: 4e2,
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
		config: environments.dispenser1,
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
	shannonKSA_dispenser: {
		name: 'Shannon KSA vs DispenserGrid',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: environments.dispenser1,
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
		config: environments.dispenser1,
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
		config: environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 1e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	ShannonKSA_dirichlet_dispenser: {
		name: 'Shannon KSA-Dirichlet vs DispenserGrid',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 1e2,
		},
		exps: [
		'dispenser_bayes',
		],
	},
	MDL_dispenser: {
		name: 'MDL vs DispenserGrid',
		agent: MDLAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		config: environments.dispenser1,
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
			epsilon: 0.1,
		},
	},
	BayesExp_dispenser: {
		name: 'BayesExp vs DispenserGrid',
		agent: BayesExp,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: environments.dispenser1,
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
		config: {
			payouts: [
				[1, 5],
				[0, 3],
			],
			opponent: AlwaysCooperate,
		},
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
			opponent: null,
		},
	},
	ql_bandit: {
		name: 'Q-Learning vs Gaussian 2-armed bandit',
		agent: QLearn,
		env: Bandit,
		vis: BanditVis,
		config: {
			dist: Normal,
			params: [
				{
					mu: 10,
					sigma: 3,
				},
				{
					mu: 8,
					sigma: 6,
				},
			],
		},
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
		config: {
			initial_state: 0,
			states: [
				{
					pos: { x: 80, y: 80 },
					actions:
					[
						{ probabilities: [0.5, 0.25, 0.25], rewards: [5, 0, 0] },
						{ probabilities: [0.9, 0.05, 0.05], rewards: [25, 0, -10] },
					],
				},
				{
					pos: { x: 160, y: 160 },
					actions:
					[
						{ probabilities: [0.5, 0.4, 0.1], rewards: [5, 0, 0] },
					],
				},
				{
					pos: { x: 300, y: 160 },
					actions:
					[
						{ probabilities: [0.5, 0.25, 0.25], rewards: [-100, 0, 0] },
						{ probabilities: [0.9, 0.05, 0.05], rewards: [25, 0, 0] },
					],
				},
			],
		},
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
