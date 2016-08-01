const demo = {
	ui: new UI(),
	run() {
		if (!this.dem) {
			return;
		}

		if (this.vis) {
			this.vis.remove();
		}

		this.env = new this.dem.env(this.dem.config);

		let options = this.ui.getOptions();
		if (!options) {
			console.error('Bad options.');
			return;
		}

		options.getEnvParams(this.env);
		this.agent = new this.dem.agent(options);
		this.trace = new this.agent.tracer(options.cycles);
		this.plots = [];
		for (let P of this.trace.plots) {
			this.plots.push(new P(this.trace));
		}

		this.ui.toggleSpinner();

		let simulate = (update) => {
			let demo = this;
			let trace = this.trace;
			let agent = this.agent;
			let env = this.env;

			let e = env.generatePercept();
			let a = null;

			function loop() {
				if (trace.iter >= trace.t) {
					demo.ui.toggleSpinner();
					demo.ui.showNav();
					demo.vis = new demo.dem.vis(env, trace);
					demo.vis.reset();
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
		};

		simulate(trace => {
			for (let p of this.plots) {
				p.dataUpdate(trace);
			}
		});

	},

	new() {
		if (this.vis) {
			this.vis.pause();
		}

		let e = document.getElementById('demo_select');
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
	aixi_dispenser: {
		name: 'AIXI vs DispenserGrid',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
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
	freshaixi_dispenser: {
		name: 'Fresh AIXI vs DispenserGrid',
		agent: FreshAIXI,
		env: SimpleDispenserGrid,
		vis: FreshBayesVis,
		config: config.environments.dispenser2,
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 500,
		},
	},
	thompson_dispenser: {
		name: 'Thompson Sampling vs DispenserGrid',
		agent: ThompsonAgent,
		env: SimpleDispenserGrid,
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
	shannonKSA_dispenser: {
		name: 'Shannon KSA vs DispenserGrid',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
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
	rofl: {
		name: 'Random Agent vs Puckworld',
		agent: Agent,
		env: Puckworld,
		vis: PuckworldVis,
		params: {
			cycles: 3e3,
		},
	},
};
