const demos = {
	aixi_dispenser: {
		name: 'MC-AIXI',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				samples: 400,
				cycles: 200,
			},
		},
	},
	dirichletaixi_dispenser: {
		name: 'MC-AIXI-Dirichlet',
		agent: BayesAgent,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				samples: 400,
				cycles: 100,
			},
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
			agent: {
				cycles: 100,
			},
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
			agent: {
				horizon: 10,
				samples: 1200,
				cycles: 400,
			},
		},
	},
	squareKSA_dispenser: {
		name: 'Square KSA',
		agent: SquareKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	shannonKSA_dispenser: {
		name: 'Shannon KSA',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	KLKSA_dispenser: {
		name: 'KL KSA',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	KLKSA_dirichlet_dispenser: {
		name: 'KL KSA-Dirichlet',
		agent: KullbackLeiblerKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	ShannonKSA_dirichlet_dispenser: {
		name: 'Shannon KSA-Dirichlet',
		agent: ShannonKSA,
		env: SimpleDispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	MDL_dispenser: {
		name: 'MDL',
		agent: MDLAgent,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	BayesExp_dispenser: {
		name: 'BayesExp',
		agent: BayesExp,
		env: SimpleDispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	aixi_ipd: {
		name: `AIXI vs IPD`,
		agent: BayesAgent,
		env: IteratedPrisonersDilemma,
		model: BayesMixture,
		trace: Trace,
		vis: null,
		params: {
			agent: {
				samples: 400,
				cycles: 100,
			},
			env: {
				payouts: [
					[1, 5],
					[0, 3],
				],
				opponent: AlwaysCooperate,
			},
		},
	},
	ql_bandit: {
		name: 'Q-Learning vs bandit',
		agent: QLearn,
		env: Bandit,
		vis: BanditVis,
		params: {
			agent: {
				alpha: 0.9,
				gamma: 0.99,
				epsilon: 0.05,
				cycles: 1e3,
			},
			env: {
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
		},
	},
	ql_mdp: {
		name: 'Q-Learning vs MDP',
		agent: QLearn,
		env: BasicMDP,
		vis: MDPVis,
		params: {
			agent: {
				alpha: 0.9,
				gamma: 0.99,
				epsilon: 0.05,
				cycles: 1e3,
			},
			env: {
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
		},
	},
	puckworld: {
		name: 'DQN vs Puckworld',
		agent: DQN,
		env: Puckworld,
		vis: PuckworldVis,
		params: {
			agent: {
				cycles: 3e3,
			},
		},
	},
	timeinconsistent: {
		name: 'Time inconsistency',
		agent: BayesAgent,
		env: TimeInconsistentEnv1,
		model: BayesMixture,
		modelParametrization: 'mu',
		vis: TIVis,
		config: config.environments.timeinconsistent1,
		params: {
			agent: {
				horizon: 10,
				samples: 1000,
				ucb: 1,
				cycles: 2e2,
			},
			env: {
				initial_state: 0,
				states: [
					{
						pos: { x: 190, y: 60 },
						type: 'start',
						index: 0,
					},
					{
						pos: { x: 80, y: 160 },
						type: 'instant',
						index: 1,

					},
					{
						pos: { x: 300, y: 160 },
						index: 2,
						type: 'delayed',
					},
				],
			},
		},
	},
};
