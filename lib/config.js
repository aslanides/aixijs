const demos = {
	aixi: {
		name: 'MC-AIXI',
		agent: BayesAgent,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	aixi_dirichlet: {
		name: 'MC-AIXI-Dirichlet',
		agent: BayesAgent,
		env: DispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	aixi_ctw: {
		name: 'MC-AIXI-CTW',
		agent: BayesAgent,
		env: DispenserGrid,
		model: CTW,
		vis: BayesGridVis,
		config: {},
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	thompson: {
		name: 'Thompson Sampling',
		agent: ThompsonAgent,
		env: DispenserGrid,
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
	sqKSA: {
		name: 'Square KSA',
		agent: SquareKSA,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	shKSA: {
		name: 'Shannon KSA',
		agent: ShannonKSA,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	KLKSA: {
		name: 'KL KSA',
		agent: KullbackLeiblerKSA,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	KLKSA_dirichlet: {
		name: 'KL KSA-Dirichlet',
		agent: KullbackLeiblerKSA,
		env: DispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	shKSA_dirichlet: {
		name: 'Shannon KSA-Dirichlet',
		agent: ShannonKSA,
		env: DispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	sqKSA_dirichlet: {
		name: 'Square KSA-Dirichlet',
		agent: SquareKSA,
		env: DispenserGrid,
		model: DirichletModel,
		tracer: DirichletTrace,
		vis: DirichletVis,
		params: {
			agent: {
				cycles: 100,
			},
		},
	},
	MDL: {
		name: 'MDL',
		agent: MDLAgent,
		env: DispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		params: {
			agent: {
				cycles: 200,
			},
		},
	},
	BayesExp: {
		name: 'BayesExp',
		agent: BayesExp,
		env: DispenserGrid,
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
	dqn_puckworld: {
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
};
