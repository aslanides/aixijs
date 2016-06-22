const demos = {
    QLearnDispenserDemo,
    QLearnEpisodicDemo,
	QLearnBanditDemo,
    AIMUDispenserDemo1,
	AIMUDispenserDemo2,
	AIMUEpisodicDemo,
    AIXIDispenserDemo,
	AIXIEpisodicDemo1,
	AIXIEpisodicDemo2,
	AIXITigerDemo,
	AIXIBanditDemo,
    ThompsonDemo1,
	ThompsonDemo2,
	SquareKSADemo,
	ShannonKSADemo
}

const rewards = {
	chocolate : 100,
	wall : -5,
	empty : -1
}

const map_symbols = {
	empty : "F",
	chocolate: "C",
	wall : "W",
	dispenser : "D",
	sign : "S"
}

const colors = {
	empty : "white",
	wall : "grey",
	chocolate : "yellow",
	dispenser : "orange",
	agent : "blue",
	sign : "red",
	tiger : "purple"
}

const environments = {
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
        initial_pos : {
            x : 0,
            y : 0
        },
        goal_pos : {
            x : 6,
            y : 6
        },
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
        initial_pos : {
            x : 0,
            y : 0
        },
        freq : 0.5,
        goal_pos : {
            x : 4,
            y : 2
        },
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
        initial_pos : {
            x : 0,
            y : 0
        },
        goal_pos : {
            x : 4,
            y : 2
        },
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
        initial_pos : {
            x : 0,
            y : 0
        },
		goal_pos : {
			x : 6,
			y : 5
		},
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

		initial_pos : {
			x : 0,
			y : 0
		},
		goal_pos : {
			x : 3,
			y : 5
		},
		M : 6,
		N : 6
	},
	tiger1 : {
		name : "tiger1",
		map :   [["F","F","F","F","F"],
                ["W","W","F","W","F"],
                ["W","F","F","F","W"],
                ["F","F","F","W","W"],
                ["W","W","F","W","W"]],
		initial_pos : {
			x : 0,
			y : 0
		},
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
	}
}
const MDPs = {
	MDP1 : {
		name : "MDP1",
		//An array of the world states (indexed by their location in this array)
		states : [
			{
				reward : 0,
				actions :
				[{probabilities  : [0.5, 0.25, 0.25]},
				{probabilities  : [0.5, 0.4, 0.1]}]	//e.g. P(S2 | S1, A2) = 0.4
			},

			{
				reward : 0,
				actions :
				[{probabilities  : [0.8, 0.2, 0]}]	//e.g. P(S1 | S2, A1) = 0.8
			},

			{
				reward : 5,
				actions :
				[{probabilities  : [0.5, 0.25, 0.25]},
				{probabilities  : [0.5, 0.4, 0.1]}]
			},

		],
		intial_state : 0;
	}
}
