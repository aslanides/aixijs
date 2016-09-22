const demos = {
	aixi_dispenser: {
		name: 'MC-AIXI',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
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
	aixi_dispenser3: {
		name: 'MC-AIXI (maze)',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
		modelParametrization: 'maze',
		params: {
			horizon: 12,
			samples: 1500,
			ucb: 1,
			cycles: 1e2,
		},
	},
	dirichletaixi_dispenser: {
		name: 'MC-AIXI-Dirichlet',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: {},
		params: {
			horizon: 6,
			samples: 400,
			ucb: 1,
			cycles: 100,
		},
	},
	ctwaixi_dispenser: {
		name: 'MC-AIXI-CTW',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: CTW,
		vis: BayesGridVis,
		config: {},
		params: {
			horizon: 5,
			samples: 100,
			ucb: 1,
			cycles: 2e1,
		},
	},
	thompson_dispenser: {
		name: 'Thompson Sampling',
		agent: ThompsonAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		config: {},
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
		name: 'Square KSA',
		agent: SquareKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
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
		name: 'Shannon KSA',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
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
		name: 'KL KSA',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
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
		name: 'KL KSA-Dirichlet',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: {},
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
		name: 'Shannon KSA-Dirichlet',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		config: {},
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
		name: 'MDL',
		agent: MDLAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		config: {},
		params: {
			horizon: 5,
			samples: 600,
			ucb: 1,
			cycles: 2e2,
			epsilon: 0.1,
		},
	},
	BayesExp_dispenser: {
		name: 'BayesExp',
		agent: BayesExp,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		config: {},
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
		name: `AIXI vs IPD`,
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
		name: 'Q-Learning vs bandit',
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
		name: 'Q-Learning vs MDP',
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
