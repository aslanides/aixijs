const config = {
	grid_topology : 5,
	tile_size_px : 40,
	rewards : {
		chocolate : 100,
		wall : -5,
		empty : 0,
		move : -1
	},
	map_symbols : {
		empty : "F",
		chocolate: "C",
		wall : "W",
		dispenser : "D",
		sign : "S"
	},
	colors : {
		empty : "#fdfdfd",
		wall : "grey",
		chocolate : "yellow",
		dispenser : "orange",
		agent : "blue",
		sign : "red",
		tiger : "purple",
		rho : "red"
	},
	test : {
		dispenser : {
			name : "test_dispenser",
			map :   [["F","W"],
					["F","F"],
					["W","F"]],
			goal_pos : {
				x: 2,
				y: 1
			},
			goal_type : "D",
			freq : 1,
			M : 3,
			N : 2
		}
	},
	environments : {
		dispenser1 : {
	        name : "dispenser1",
	        map :   [["F","F","F","F","F","W","W"],
	                ["W","W","F","W","F","F","F"],
	                ["W","F","F","F","W","W","F"],
	                ["F","F","F","W","W","F","F"],
	                ["W","W","F","W","F","F","W"],
					["F","F","F","F","F","W","W"],
					["F","W","F","W","F","F","F"]],
	        freq : 0.5,
	        goal_pos : {
	            x : 6,
	            y : 6
	        },
			goal_type : "D",
			M : 7,
			N : 7
	    },
	    dispenser2 : {
	        name : "dispenser2",
	        map :   [["F","F","F","F","F"],
	                ["F","F","F","F","F"],
	                ["F","F","F","F","F"],
	                ["F","F","F","F","F"],
	                ["F","F","F","F","F"]],
	        freq : 0.5,
	        goal_pos : {
	            x : 4,
	            y : 2
	        },
			goal_type : "D",
			M : 5,
			N : 5
	    },
		dispenser3 : {
	        name : "dispenser3",
	        map :   [["F","F","F","F","F"],
	                ["W","W","F","W","F"],
	                ["W","F","F","F","W"],
	                ["F","F","F","W","W"],
	                ["W","W","F","W","F"]],
	        freq : 0.5,
	        goal_pos : {
	            x : 4,
	            y : 2
	        },
			goal_type : "D",
			M : 5,
			N : 5
	    },
	    episodic1 : {
	        name : "episodic1",
	        map :   [["F","F","W","F","F","F","F","F","F"],
	                ["F","F","W","F","F","F","F","F","F"],
	                ["F","W","W","F","F","F","F","F","F"],
	                ["F","F","F","F","F","F","F","F","F"],
	                ["F","W","W","W","W","W","W","F","F"],
	                ["F","F","W","F","F","F","W","F","F"],
	                ["F","F","W","F","W","F","W","F","F"],
	                ["F","F","W","F","W","W","W","F","F"],
	                ["F","F","W","F","F","F","F","F","F"]],
			goal_pos : {
				x : 6,
				y : 5
			},
			goal_type : "C",
			M : 9,
			N : 9
	    },
		episodic2 : {
			name : "episodic2",
			map :   [["F","F","F","W","F","F"],
					["W","F","F","F","W","F"],
					["W","F","F","F","F","F"],
					["F","F","F","W","F","F"],
					["F","F","F","W","F","F"],
					["F","F","F","F","F","F"]],
			goal_pos : {
				x : 3,
				y : 5
			},
			goal_type : "C",
			M : 6,
			N : 6
		},
		windy : {
			name : "windy",
			map : [["F","F","W","W","F"],
					["F","F","W","W","F"],
					["F","F","F","F","F"],
					["F","F","W","W","F"],
					["F","F","W","W","F"]],
			goal_pos : {
				x : 4,
				y : 4
			},
			goal_type : "C",
			wind : {
				x : 1,
				y : 0
			},
			M : 5,
			N : 5
		},
		tiger1 : {
			name : "tiger1",
			map :   [["F","F","F","F","F"],
	                ["W","W","F","W","F"],
	                ["W","F","F","F","W"],
	                ["F","F","F","W","W"],
	                ["W","W","F","W","W"]],
			tiger_pos : {
				x : 4,
				y : 2
			},
			sign_pos : {
				x : 0,
				y : 4
			},
			M : 5,
			N : 5,
		},
		gaussbandit : {
			name : "gaussbandit",
			dist : NormalDistribution,
			params : [
				{
					mu : 10,
					sigma : 3
				},
				{
					mu : 8,
					sigma : 6
				}
			]
		},
		mdp : {
			initial_state : 0,
			name : "MDP1",
			//An array of the world states (indexed by their location in this array)
			states : [
				{
					pos : {x : 80, y: 80},
					actions :
					[{probabilities  : [0.5, 0.25, 0.25], rewards : [5, 0, 0]},
					{probabilities  : [0.99, 0.005, 0.005], rewards : [25, 0, -10]}]	//e.g. P(S2 | S1, A2) = 0.4
				},
				{
					pos : {x : 160, y: 160},
					actions :
					[{probabilities  : [0.5, 0.4, 0.1], rewards : [5, 0, 0]}]	//e.g. P(S1 | S2, A1) = 0.8
				},
				{
					pos : {x : 300, y: 160},
					actions :
					[{probabilities  : [0.5, 0.25, 0.25], rewards : [-100, 0, 0]},
					{probabilities  : [0.9, 0.05, 0.05], rewards : [25, 0, 0]}]
				}
			]
		}
	}
}

const demos = {
	random : {
		name : "Random Agent",
		agent : RandomAgent,
		env : SimpleEpisodicGrid,
		vis : GridVisualization,
		config : config.environments.episodic1,
		params : {
			cycles : 1e5
		}
	},
	ql_episodic : {
		name : "Q-Learning vs EpisodicGrid",
		agent : QLearn,
		env : SimpleEpisodicGrid,
		vis : TabularGridVis,
		config : config.environments.episodic1,
		params : {
			alpha : 0.9,
			gamma : 0.99,
			epsilon : 0.01,
			cycles : 1e5
		}
	},
	ql_bandit : {
		name : "Q-Learning vs Gaussian 2-armed bandit",
		agent : QLearn,
		env : Bandit,
		vis : GaussianBanditVis,
		config : config.environments.gaussbandit,
		params : {
			alpha : 0.9,
			gamma : 0.99,
			epsilon: 0.05,
			cycles: 1e3
		}
	},
	ql_mdp : {
		name : "Q-Learning vs simple MDP",
		agent : QLearn,
		env : BasicMDP,
		vis : MDPVis,
		config : config.environments.mdp,
		params : {
			alpha : 0.9,
			gamma : 0.99,
			epsilon: 0.05,
			cycles: 1e3
		}
	},
	aixi_dispenser : {
		name : "AIXI vs DispenserGrid",
		agent : BayesAgent,
		env : SimpleDispenserGrid,
		vis : AIXIVis,
		config : config.environments.dispenser1,
		params : {
			horizon : 6,
			samples : 400,
			ucb : 1,
			cycles : 100
		},
		exps : [
			"dispenser_bayes"
		]
	},
	thompson_dispenser : {
		name : "Thompson Sampling vs DispenserGrid",
		agent : ThompsonAgent,
		env: SimpleDispenserGrid,
		vis : ThompsonVis,
		config : config.environments.dispenser1,
		params : {
			horizon:6,
			samples:1200,
			ucb:1,
			cycles:200
		}
	},
	squareKSA_dispenser : {
		name : "Square KSA vs DispenserGrid",
		agent : SquareKSA,
		env : SimpleDispenserGrid,
		vis : AIXIVis,
		config : config.environments.dispenser1,
		params : {
			horizon:5,
			samples:600,
			ucb:1,
			cycles:400
		}
	},
	squareKSA_episodic : {
		name : "Square KSA vs EpisodicGrid",
		agent : SquareKSA,
		env : EpisodicGrid,
		vis : AIXIVis,
		config : config.environments.episodic1,
		params : {
			horizon:5,
			samples:600,
			ucb:1,
			cycles:400
		}
	}
}
