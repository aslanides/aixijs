const demos = {
	RandomEpisodic,
    QLearnDispenser,
    QLearnEpisodic,
	QLearnBandit,
	QLearnMDP,
    AIMUDispenser1,
	AIMUDispenser2,
	AIMUEpisodic,
    AIXIDispenser,
	AIXIEpisodic1,
	AIXIEpisodic2,
	AIXITiger,
	AIXIWindy,
	AIXIBandit,
    Thompson1,
	Thompson2,
	ThompsonDispenser,
	SquareKSAEpisodic,
	SquareKSADispenser,
	ShannonKSAEpisodic
}

const config = {
	grid_topology : 5,
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
		tiger : "purple"
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
		MDP1 : {
			initial_state : 0,
			name : "MDP1",
			//An array of the world states (indexed by their location in this array)
			states : [
				{
					pos : {x : 80, y: 80},
					actions :
					[{probabilities  : [0.5, 0.25, 0.25], rewards : [5, 25, 25]},
					{probabilities  : [0.5, 0.4, 0.1], rewards : [5, 25, 25]}]	//e.g. P(S2 | S1, A2) = 0.4
				},
				{
					pos : {x : 160, y: 160},
					actions :
					[{probabilities  : [0.5, 0.4, 0.1], rewards : [5, 25, 25]}]	//e.g. P(S1 | S2, A1) = 0.8
				},
				{
					pos : {x : 300, y: 160},
					actions :
					[{probabilities  : [0.5, 0.25, 0.25], rewards : [5, 25, 25]},
					{probabilities  : [0.5, 0.4, 0.1], rewards : [5, 25, 25]}]
				}
			]
		}
	}
}
