const demos = {
    QLearnDemo1,
    QLearnDemo2,
    AIMUDemo1,
	AIMUDemo2,
    AIXIDemo1,
	AIXIDemo2,
	AIXIDemo3,
	AIXIDemo4,
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
        map :   [["F","F","F","F","F"],
                ["W","W","F","W","F"],
                ["W","F","F","F","W"],
                ["F","F","F","W","W"],
                ["W","W","F","W","W"]],
        freq : 0.5,
        initial_pos : {
            x : 0,
            y : 0
        },
        dispenser_pos : {
            x : 4,
            y : 2
        },
		M : 5,
		N : 5
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
        dispenser_pos : {
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
		chocolate_pos : {
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
		chocolate_pos : {
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
