const demos = {
	RandomDemo,
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
	empty : 0,
	move : -1
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
	}
}
