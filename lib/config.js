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
	},
	colors: {
		empty: '#fdfdfd',
		wall: 'grey',
		chocolate: 'yellow',
		dispenser: 'orange',
		agent: 'blue',
		sign: 'red',
		tiger: 'purple',
		rho: 'red',
	},
	test: {
		dispenser: {
			name: 'test_dispenser',
			map:   [
				['F', 'F'],
				['F', 'F'],
				['F', 'F'],
			],
			goal_pos: {
				x: 1,
				y: 2,
			},
			goal_type: 'D',
			freq: 1,
			M: 3,
			N: 2,
		},
	},
	environments: {
		dispenser1: {
			name: 'dispenser1',
			map:   [
				['F', 'F', 'F', 'F', 'F', 'W', 'W'],
				['W', 'W', 'F', 'W', 'F', 'F', 'F'],
				['W', 'F', 'F', 'F', 'W', 'W', 'F'],
				['F', 'F', 'F', 'W', 'W', 'F', 'F'],
				['W', 'W', 'F', 'W', 'F', 'F', 'W'],
				['F', 'F', 'F', 'F', 'F', 'W', 'W'],
				['F', 'W', 'F', 'W', 'F', 'F', 'F'],
			],
			freq: 0.5,
			goal_pos: {
				x: 6,
				y: 6,
			},
			goal_type: 'D',
			M: 7,
			N: 7,
		},
		dispenser2: {
			name: 'dispenser2',
			map:   [
				['F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F'],
			],
			freq: 1,
			goal_pos: {
				x: 4,
				y: 2,
			},
			goal_type: 'D',
			M: 5,
			N: 5,
		},
		dispenser3: {
			name: 'dispenser3',
			map:   [
				['F', 'F', 'F', 'F', 'F'],
				['W', 'W', 'F', 'W', 'F'],
				['W', 'F', 'F', 'F', 'W'],
				['F', 'F', 'F', 'W', 'W'],
				['W', 'W', 'F', 'W', 'F'],
			],
			freq: 0.5,
			goal_pos: {
				x: 4,
				y: 2,
			},
			goal_type: 'D',
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
			goal_pos: {
				x: 5,
				y: 6,
			},
			goal_type: 'C',
			M: 9,
			N: 9,
		},
		episodic2: {
			name: 'episodic2',
			map:   [
				['F', 'F', 'F', 'W', 'F', 'F'],
				['W', 'F', 'F', 'F', 'W', 'F'],
				['W', 'F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'F', 'W', 'F', 'F'],
				['F', 'F', 'F', 'W', 'F', 'F'],
				['F', 'F', 'F', 'F', 'F', 'F'],
			],
			goal_pos: {
				x: 5,
				y: 3,
			},
			goal_type: 'C',
			M: 6,
			N: 6,
		},
		windy: {
			name: 'windy',
			map: [
				['F', 'F', 'W', 'W', 'F'],
				['F', 'F', 'W', 'W', 'F'],
				['F', 'F', 'F', 'F', 'F'],
				['F', 'F', 'W', 'W', 'F'],
				['F', 'F', 'W', 'W', 'F'],
			],
			goal_pos: {
				x: 4,
				y: 4,
			},
			goal_type: 'C',
			wind: {
				x: 1,
				y: 0,
			},
			M: 5,
			N: 5,
		},
		tiger1: {
			name: 'tiger1',
			map:   [
				['F', 'F', 'F', 'F', 'F'],
				['W', 'W', 'F', 'W', 'F'],
				['W', 'F', 'F', 'F', 'W'],
				['F', 'F', 'F', 'W', 'W'],
				['W', 'W', 'F', 'W', 'W'],
			],
			tiger_pos: {
				x: 4,
				y: 2,
			},
			sign_pos: {
				x: 0,
				y: 4,
			},
			M: 5,
			N: 5,
		},
		gaussbandit: {
			name: 'gaussbandit',
			dist: NormalDistribution,
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
		mdp: {
			initial_state: 0,
			name: 'MDP1',
			states: [
			{
				pos: { x: 80, y: 80 },
				actions:
				[
					{ probabilities: [0.5, 0.25, 0.25], rewards: [5, 0, 0] },
					{ probabilities: [0.99, 0.005, 0.005], rewards: [25, 0, -10] },
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
