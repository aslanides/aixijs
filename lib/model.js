class Model {
	constructor(Cl, cfg) {
		this.config = Util.deepCopy(cfg);
		this.config.goal_pos = null;
		this.env = new Cl(cfg);
		this.M = cfg.M;
		this.N = cfg.N;
		this.disps = [];
		this.weights = [];
		for (let i = 0; i < this.M; i++) {
			let row = [];
			let weightRow = [];
			for (let j = 0; j < this.N; j++) {
				row.push(new Dispenser(i, j, 1));
				weightRow.push(0.1);
			}

			this.weights.push(weightRow);
			this.disps.push(row);
		}

	}
}
