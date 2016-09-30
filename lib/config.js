const glossary = {
	N: 'Dimensions of gridworld',
	freq: 'Frequency that the dispenser dispenses rewards',
	cycles: 'Number of cycles to run the simulation for (you can stop the simulation early)',
	gamma: 'Geometric discount rate',
	ucb: 'Upper Confidence Bound parameter for MCTS planning',
	samples: 'Number of samples to use in MCTS',
	horizon: `Agent's planning horizon`,
};

const configs = {
	aixi: {
		active: true,
		name: 'MC-AIXI',
		description: 'Monte Carlo AIXI on a known Gridworld.',
		vis: BayesGridVis,
		agent: {
			type: BayesAgent,
		},
		env: {
			type: Gridworld,
		},
	},
	aixi_dirichlet: {
		active: true,
		name: 'MC-AIXI-Dirichlet',
		description: ' AIXI with a Dirichlet model on an unknown Gridworld.',
		vis: DirichletVis,
		agent: {
			type: BayesAgent,
			model: DirichletModel,
			cycles: 100,
			tracer: DirichletTrace,
		},
		env: {
			type: Gridworld,
		},
	},
	aixi_ctw: {
		name: 'MC-AIXI-CTW',
		vis: BayesGridVis,
		agent: {
			type: BayesAgent,
			model: CTW,
			cycles: 100,
		},
		env: {
			type: Gridworld,
		},
	},
	thompson: {
		active: true,
		name: 'Thompson Sampling',
		description: 'Thompson sampling on a known Gridworld.',
		vis: ThompsonVis,
		agent: {
			type: ThompsonAgent,
			horizon: 15,
			samples: 2500,
		},
		env: {
			type: Gridworld,
		},
	},
	shksa: {
		name: 'Shannon KSA',
		vis: BayesGridVis,
		agent: {
			type: ShannonKSA,
		},
		env: {
			type: Gridworld,
		},
	},
	sqksa: {
		name: 'Square KSA',
		vis: BayesGridVis,
		agent: {
			type: SquareKSA,
		},
		env: {
			type: Gridworld,
		},
	},
	klksa: {
		active: true,
		name: 'Knowledge-seeking agent',
		description: 'Kullback-Leibler KSA on a known Gridworld.',
		vis: BayesGridVis,
		agent: {
			type: KullbackLeiblerKSA,
		},
		env: {
			type: Gridworld,
		},
	},
	klksa_dirichlet: {
		active: true,
		name: 'KSA-Dirichlet',
		description: 'Kullback-Leibler KSA on an unknown Gridworld.',
		vis: DirichletVis,
		agent: {
			type: KullbackLeiblerKSA,
			model: DirichletModel,
			tracer: DirichletTrace,
			cycles: 100,
		},
		env: {
			type: Gridworld,
		},
	},
	shksa_dirichlet: {
		active: true,
		name: 'Entropy-seeking agent',
		description: 'Shannon KSA on an unknown Gridworld.',
		vis: DirichletVis,
		agent: {
			type: ShannonKSA,
			model: DirichletModel,
			tracer: DirichletTrace,
			cycles: 100,
		},
		env: {
			type: Gridworld,
		},
	},
	sqksa_dirichlet: {
		name: 'Square KSA-Dirichlet',
		vis: DirichletVis,
		agent: {
			type: SquareKSA,
			model: DirichletModel,
			tracer: DirichletTrace,
			cycles: 100,
		},
		env: {
			type: Gridworld,
		},
	},
	mdl: {
		active: true,
		name: 'MDL [broken]',
		description: `Tor's Minimum Description Length agent.`,
		vis: ThompsonVis,
		agent: {
			type: MDLAgent,
		},
		env: {
			type: Gridworld,
		},
	},
	bayesexp: {
		active: true,
		name: 'BayesExp',
		description: 'Bayesian agent with bursts of directed exploration.',
		vis: BayesGridVis,
		agent: {
			type: MDLAgent,
		},
		env: {
			type: Gridworld,
		},
	},
	ipd: {
		active: true,
		name: `Iterated prisoner's dilemma [broken]`,
		vis: {},
		agent: {
			type: BayesAgent,
			cycles: 100,
		},
		env: {
			type: IteratedPrisonersDilemma,
			_payouts: [
				[1, 5],
				[0, 3],
			],
			opponent: AlwaysCooperate,
		},
	},
	ql_dispenser: {
		name: 'Q-Learning',
		vis: TabularGridVis,
		agent: {
			type: QLearn,
			alpha: 0.9,
			epsilon: 0.05,
			cycles: 400,
		},
		env: {
			type: Gridworld,
		},
	},
	bandit: {
		active: true,
		name: 'Bandit [broken]',
		vis: BanditVis,
		agent: {
			type: QLearn,
			alpha: 0.9,
			gamma: 0.99,
			epsilon: 0.05,
			cycles: 1e3,
		},
		env: {
			type: Bandit,
			dist: Normal,
			_params: [
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
	},
	mdp: {
		active: true,
		name: 'MDP [broken]',
		vis: MDPVis,
		agent: {
			type: QLearn,
			alpha: 0.9,
			gamma: 0.99,
			epsilon: 0.05,
			cycles: 1e3,
		},
		env: {
			type: BasicMDP,
			_initial_state: 0,
			_states: [
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
	},
	wirehead: {
		active: true,
		name: 'Wireheading [broken]',
		description: 'AIXI has an opportunity to change its sensors and wirehead. Does it take it?',
		vis: BayesGridVis,
		agent: {
			type: BayesAgent,
		},
		env: {
			type: WireheadingGrid,
			_mods: function (env) {
				let pos = Gridworld.proposeGoal(env.options.N);
				let t = env.grid[pos.y][pos.x];
				if (t.expanded) {
					t = new SelfModificationTile(t.y, t.x);
					env.grid[pos.y][pos.x] = t;
					env.options.map[pos.x][pos.y] = 'M';
				} else {
					this.mods(env);
				}

				env.generateConnexions();
			},
		},
	},
	dogmatic_prior: {
		active: true,
		name: 'AIXI with a dogmatic prior',
		description: `AIXI is given a prior that says it is surrounded by traps with high probability.
		It is too scared to do anything as a result and never overcomes the bias of its prior.`,
		vis: BayesGridVis,
		agent: {
			type: BayesAgent,
			model: BayesMixture,
			cycles: 100,
			_mods: function (agent) {
				for (let m of agent.model.modelClass) {
					if (m.grid[0][1].constructor != Wall) m.grid[0][1] = new Trap(1, 0);
					if (m.grid[1][0].constructor != Wall) m.grid[1][0] = new Trap(0, 1);
					m.generateConnexions();
				}
			},
		},
		env: {
			type: Gridworld,
		},
	},
	heaven_hell: {
		active: true,
		name: 'Heaven and Hell [broken]',
		description: 'Heaven and Hell example',
		vis: MDPVis,
		agent: {
			type: BayesAgent,
			cycles: 10,
		},
		env: {
			type: BasicMDP,
			_initial_state: 0,
			_states: [
				{
					pos: { x: 80, y: 80 },
					actions:
					[
						{ probabilities: [0, 1, 0], rewards: [0, 1, 0] },
						{ probabilities: [0, 0, 1], rewards: [0, 0, 0] },
					],
				},
				{
					pos: { x: 160, y: 160 },
					actions:
					[
						{ probabilities: [0, 1, 0], rewards: [0, 1, 0] },
					],
				},
				{
					pos: { x: 300, y: 160 },
					actions:
					[
						{ probabilities: [0, 0, 1], rewards: [0, 0, 1] },
					],
				},
			],
		},
	},
	dqn_puckworld: {
		name: 'DQN vs Puckworld',
		agent: DQN,
		env: Puckworld,
		vis: PuckworldVis,
		agent: {
			type: DQN,
			cycles: 3e3,
		},
		env: {
			type: Puckworld,
		},
	},
	time_inconsistent: {
		active: true,
		name: 'Time inconsistency',
		description: `A simple environment in which AImu can be made time-inconsistent by
		 certain choices of discount functions.`,
		vis: TIVis,
		agent: {
			type: BayesAgent,
			model: BayesMixture,
			modelParametrization: 'mu',
			horizon: 10,
			samples: 1000,
			cycles: 2e2,
			/*
			mods: function(agent) {
				let discountChanges = [];
				let discounts = [];

				// discount 6 ahead to plan for high reward, then change
				// mind right before to discount only 1, contradicting the previous plan
				for (let i = 0; i < this.cycles; i++) {
					discountChanges[i] = i;
					if (i % 5 == 0) {
						discounts.push(new ConstantHorizonDiscount(1));
					} else discounts.push(new ConstantHorizonDiscount(this.horizon));
				}

				agent.discount = new MatrixDiscount(discounts, discountChanges);
			},
			*/
		},
		env: {
			type: TimeInconsistentEnv,
		},
	},
};
