class BayesMixture {
	constructor(modelClass, weights) {
		this.modelClass = [...modelClass];
		this.weights = [...weights];

		this.saved_weights = [];
		this.C = modelClass.length;

		Util.assert(Math.abs(Util.sum(weights) - 1) < 1e-4, 'Prior is not normalised!');
	}

	xi(e) {
		let s = 0;
		for (let i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] == 0) {
				continue;
			}

			s += this.weights[i] * this.modelClass[i].conditionalDistribution(e);
		}

		Util.assert(s != 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);
		return s;
	}

	update(a, e) {
		this.perform(a);
		this.bayesUpdate(a, e);
	}

	bayesUpdate(a, e) {
		var xi = 0;
		for (var i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] == 0) {
				continue;
			}

			this.weights[i] = this.weights[i] * this.modelClass[i].conditionalDistribution(e);
			xi += this.weights[i];
		}

		Util.assert(xi != 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);

		for (var i = 0, C = this.C; i < C; i++) {
			this.weights[i] /= xi;
		}
	}

	perform(a) {
		for (let i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] == 0) {
				continue;
			}

			this.modelClass[i].perform(a);
		}
	}

	generatePercept() {
		let nu = Util.sample(this.weights);
		return this.modelClass[nu].generatePercept();
	}

	entropy() {
		return Util.entropy(this.weights)
	}

	save() {
		this.saved_weights = [...this.weights];
		for (let i = 0, C = this.C; i < C; i++) {
			this.modelClass[i].save();
		}
	}

	load() {
		this.weights = [...this.saved_weights];
		for (let i = 0, C = this.C; i < C; i++) {
			this.modelClass[i].load();
		}
	}

	get(nu) {
		return this.modelClass[nu];
	}

	info_gain() {
		return Util.entropy(this.saved_weights) - Util.entropy(this.weights)
	}
}
