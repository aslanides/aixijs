const config = {
	grid_topology: 5,
	tile_size_px: 40,
	rewards: {
		chocolate: 100,
		wall: -5,
		empty: 0,
		move: -1,
	},
	map_symbols: {
		empty: 'F',
		chocolate: 'C',
		wall: 'W',
		dispenser: 'D',
		sign: 'S',
		trap: 'T',
	},
	colors: {
		empty: '#fdfdfd',
		wall: 'grey',
		chocolate: 'yellow',
		dispenser: 'orange',
		agent: 'blue',
		sign: 'red',
		trap: 'pink',
		rho: 'red',
	},
	opponents: {
		AlwaysCooperate,
		AlwaysDefect,
		Random,
		TitForTat,
		SuspiciousTitForTat,
		TitForTwoTats,
		Pavlov,
		Adaptive,
		Grudger,
		Gradual,
	},
	environments: {
		dispenser1: {
			randomize: true,
			goals: [
				{
					freq: 0.75,
				},
			],
			M: 10,
			N: 10,
		},
		dispenser2: {
			goals: [
				{
					freq: 0.75,
				},
				{
					freq: 0.5,
				},
				{
					freq: 0.25,
				},
			],
			M: 10,
			N: 10,
		},
		gaussbandit: {
			name: 'gaussbandit',
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
		prisoners_dilemma: {
			payouts: [
				[1, 5],
				[0, 3],
			],
			opponent: AlwaysCooperate,
		},
		mdp: {
			initial_state: 0,
			name: 'MDP1',
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
};
