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
			map:   [
				['F', 'F', 'F', 'F', 'F', 'W', 'W'],
				['W', 'W', 'F', 'W', 'F', 'F', 'F'],
				['W', 'F', 'F', 'F', 'W', 'W', 'F'],
				['F', 'F', 'F', 'W', 'W', 'F', 'F'],
				['W', 'W', 'F', 'T', 'F', 'F', 'W'],
				['F', 'F', 'F', 'F', 'F', 'W', 'W'],
				['F', 'W', 'F', 'W', 'F', 'F', 'F'],
			],
			random: true,
			goals: [
				{
					pos: {
						x: 6,
						y: 6,
					},
					type: 'D',
					freq: 0.75,
				},
			],
			M: 10,
			N: 10,
		},
		dispenser3: {
			map:   [
				['F', 'F', 'F', 'F', 'F'],
				['W', 'W', 'W', 'W', 'F'],
				['F', 'F', 'F', 'F', 'F'],
				['W', 'W', 'W', 'W', 'F'],
				['F', 'F', 'F', 'F', 'F'],
			],
			goals: [
				{
					pos: {
						x: 4,
						y: 2,
					},
					type: 'D',
					freq: 0.15,
				},
				{
					pos: {
						x: 4,
						y: 4,
					},
					type: 'D',
					freq: 1,
				},
				{
					pos: {
						x: 0,
						y: 4,
					},
					type: 'D',
					freq: 0.5,
				},
			],
			M: 5,
			N: 5,
		},
		episodic1: {
			name: 'episodic1',
			map:   [
				['F', 'F', 'W', 'F', 'F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'W', 'F', 'F', 'F', 'F', 'F', 'F'],
				['F', 'W', 'W', 'F', 'F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
				['F', 'W', 'W', 'W', 'W', 'W', 'W', 'F', 'F'],
				['F', 'F', 'W', 'F', 'F', 'F', 'W', 'F', 'F'],
				['F', 'F', 'W', 'F', 'W', 'F', 'W', 'F', 'F'],
				['F', 'F', 'W', 'F', 'W', 'W', 'W', 'F', 'F'],
				['F', 'F', 'W', 'F', 'F', 'F', 'F', 'F', 'F'],
			],
			random: true,
			goals: [
				{
					pos: {
						x: 5,
						y: 6,
					},
					type: 'C',
				},
			],
			M: 9,
			N: 9,
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
