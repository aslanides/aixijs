const demos = {
	aixi: {
		active: true,
		name: 'MC-AIXI',
		description: 'Monte Carlo AIXI on a known Gridworld.',
		agent: BayesAgent,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 400,
			},
		},
	},
	aixi_dirichlet: {
		active: true,
		name: 'MC-AIXI-Dirichlet',
		description: ' AIXI with a Dirichlet model on an unknown Gridworld.',
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
		active: true,
		name: 'Thompson Sampling',
		description: 'Thompson sampling on a known Gridworld.',
		agent: ThompsonAgent,
		env: DispenserGrid,
		model: BayesMixture,
		vis: ThompsonVis,
		config: {},
		params: {
			agent: {
				horizon: 15,
				samples: 2500,
				cycles: 400,
			},
		},
	},
	shksa: {
		name: 'Shannon KSA',
		agent: ShannonKSA,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 400,
			},
		},
	},
	sqksa: {
		name: 'Square KSA',
		agent: SquareKSA,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 400,
			},
		},
	},
	klksa: {
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
	klksa_dirichlet: {
		active: true,
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
	shksa_dirichlet: {
		active: true,
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
	sqksa_dirichlet: {
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
	mdl: {
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
	bayesexp: {
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
	ql_dispenser: {
		name: 'Q-Learning vs DispenserGrid',
		agent: QLearn,
		env: DispenserGrid,
		vis: TabularGridVis,
		params: {
			agent: {
				alpha: 0.9,
				gamma: 0.99,
				epsilon: 0.05,
				cycles: 400,
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
	aixi_wirehead: {
		name: 'MC-AIXI Wireheading',
		agent: BayesAgent,
		env: WireheadingGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 400,
			},
			env: {
				mods: function (env) {
					console.log('called');
					let pos = Gridworld.proposeGoal(env.config.N);
					let t = env.grid[pos.y][pos.x];
					if (t.expanded) {
						t = new SelfModificationTile(t.y, t.x);
						env.grid[pos.y][pos.x] = t;
						env.config.map[pos.x][pos.y] = 'M';
					} else {
						this.mods(env);
					}

					env.generateConnexions();
				},
			},
		},
	},
	bad_priors: {
		name: 'AIXI with dogmatic prior',
		agent: BayesAgent,
		env: DispenserGrid,
		model: BayesMixture,
		vis: BayesGridVis,
		params: {
			agent: {
				cycles: 100,
				mods: function (agent) {
					for (let m of agent.model.modelClass) {
						if (m.grid[0][1].constructor != Wall) m.grid[0][1] = new Trap(1, 0);
						if (m.grid[1][0].constructor != Wall) m.grid[1][0] = new Trap(0, 1);
						m.generateConnexions();
					}
				},
			},
		},
	},
	/*heaven_hell: {
		name: 'Heaven and Hell',
		agent: BayesAgent,
		env: BasicMDP,
		vis: MDPVis,
		params: {
			agent: {
				cycles: 10,
			},
			env: {
				initial_state: 0,
				states: [
					{

					}
				]
			},
		},
	},*/
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
	timeinconsistent: {
		name: 'Time inconsistency',
		agent: BayesAgent,
		env: TimeInconsistentEnv,
		model: BayesMixture,
		modelParametrization: 'mu',
		vis: TIVis,
		params: {
			agent: {
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
			env: {},
		},
	},
};
