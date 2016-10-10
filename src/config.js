const glossary = {
	N: {
		label: 'N',
		description: 'Dimensions of gridworld',
	},
	freq: {
		label: 'Theta',
		description: 'Frequency that the dispenser dispenses rewards',
	},
	cycles: {
		label: 'Cycles',
		description: 'Number of cycles to run the simulation for (you can stop the simulation early)',
	},
	gamma: {
		label: 'Gamma',
		description: 'Geometric discount rate',
	},
	ucb: {
		label: 'UCB',
		description: 'Upper Confidence Bound parameter for Monte-carlo Tree Search planning',
	},
	samples: {
		label: 'MCTS Samples',
		description: 'Number of samples to use in Monte-Carlo Tree Search',
	},
	horizon: {
		label: 'Horizon',
		description: `Agent's planning horizon`,
	},
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
	aimu: {
		name: 'MC-AIMU',
		description: 'Monte Carlo AIMU on a known Gridworld.',
		vis: BayesGridVis,
		agent: {
			type: BayesAgent,
			modelParametrization: 'mu',
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
			model: DirichletGrid,
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
			ucb: 1,
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
	hooked_on_noise: {
		active: true,
		name: 'Hooked on noise',
		description: `Entropy-seeking agents get hooked on white noise and stop exploring,
		while the knowledge-seeking agent ignores it.`,
		vis: BayesGridVis,
		agent: {
			agents: { SquareKSA, ShannonKSA, KullbackLeiblerKSA },
			type: SquareKSA,
			_mods: function (agent) {
				for (let nu of agent.model.modelClass) {
					nu.grid[0][1] = new NoiseTile(0, 1);
					nu.generateConnexions();
				}
			},
		},
		env: {
			type: Gridworld,
			_mods: function (env) {
				env.grid[0][1] = new NoiseTile(0, 1);
				env.generateConnexions();
			},
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
			model: DirichletGrid,
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
			model: DirichletGrid,
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
			model: DirichletGrid,
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
		description: `The iterated prisoner's dilemma. AIXI must figure out who its opponent is,
		and play the appropriate strategy in response.`,
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
		description: 'A simple two-armed Gaussian bandit, where mu and sigma are unknown for each arm.',
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
		description: 'A simple, fully connected MDP with three states.',
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
		name: 'Wireheading',
		description: `AIXI has an opportunity to change its sensors and wirehead,
		 so that it deludes itself that every action is maximally rewarding. Does it take it?`,
		vis: WireHeadVis,
		agent: {
			type: BayesAgent,
		},
		env: {
			type: WireheadingGrid,
			_mods: function (env) {
				let pos = Gridworld.proposeGoal(env.options.N);
				let t = env.grid[pos.x][pos.y];
				if (t.expanded) {
					t = new SelfModificationTile(t.x, t.y);
					env.grid[pos.x][pos.y] = t;
					env.options.map[pos.y][pos.x] = 'M';
				} else {
					this._mods(env);
				}

				env.generateConnexions();
			},
		},
	},
	dogmatic_prior: {
		active: true,
		name: 'Dogmatic prior',
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
		description: `The canonical Heaven and Hell example:
		the agent is presented with two doors: one leads to heaven (reward 1 forever),
		and one leads to hell (reward 0 forever. It has no idea a priori which is which.`,
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
			ucb: 0.03,
			/*
			_mods: function(agent) {
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
	time2: {
		active: true,
		name: 'Time inconsistency2',
		description: `A simple environment in which AImu can be made time-inconsistent by
		 certain choices of discount functions.`,
		vis: MDPVis,
		agent: {
			type: BayesAgent,
			model: BayesMixture,
			modelParametrization: 'mu',
		},
		env: {
			type: BasicMDP,
			_initial_state: 0,
			min_reward: 0,
			max_reward: 1000,
			_states: [
				{
					pos: { x: 80, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 1, 0, 0, 0, 0, 0],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 140, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 0, 1, 0, 0, 0, 0],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 200, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 0, 0, 1, 0, 0, 0],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 260, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 0, 0, 0, 1, 0, 0],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 320, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 0, 0, 0, 0, 1, 0],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 380, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [0, 0, 0, 0, 0, 0, 1],
							rewards: [0, 0, 0, 0, 0, 0, 0], },
					],
				},
				{
					pos: { x: 380, y: 80 },
					actions:
					[
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [4, 0, 0, 0, 0, 0, 0], },
						{ probabilities: [1, 0, 0, 0, 0, 0, 0],
							rewards: [1000, 0, 0, 0, 0, 0, 0], },
					],
				},
			],
		},
	},
	mdp2: {
		active: true,
		name: 'MDP2',
		vis: MDP2Vis,
		agent: {
			type: BayesAgent,
			model: BayesMixture,
			modelParametrization: 'mu',
		},
		env: {
			type: MDP,
			numStates: 7,
			numActions: 2,
			transitions: [

				// [a][s][s']
				[
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0, 0],
				],
				[
					[0, 1, 0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0, 0, 0],
					[0, 0, 0, 1, 0, 0, 0],
					[0, 0, 0, 0, 1, 0, 0],
					[0, 0, 0, 0, 0, 1, 0],
					[0, 0, 0, 0, 0, 0, 1],
					[1, 0, 0, 0, 0, 0, 0],
				],
			],
			rewards: [

				// [s][a]
				[4, 0],
				[4, 0],
				[4, 0],
				[4, 0],
				[4, 0],
				[4, 0],
				[4, 1000],
			],
		},
	},
};
