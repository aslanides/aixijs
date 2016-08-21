class BayesMixture {
	constructor(options) {
		this.modelClass = [...options.modelClass];
		this.saved_weights = [];
		this.C = options.modelClass.length;
		//this.t = 0

		if (options.priorType == 'Ockham') {
			throw 'TODO';
		} else if (options.priorType == 'Dogmatic') {
			throw 'TODO';
		} else if (options.priorType == 'Informed') {
			Util.assert(options.mu, 'Model index not specified!');
			this.weights = Util.zeros(this.C);
			this.weights[options.mu] = 1;
		} else {
			this.weights = [...options.modelWeights];
		}

		Util.assert(Math.abs(Util.sum(this.weights) - 1) < 1e-4, 'Prior is not normalised!');
	}

	xi(e) {
		let s = 0;
		for (let i = 0; i < this.C; i++) {
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
	//	this.t++
		this.bayesUpdate(a, e);
	}

	bayesUpdate(a, e) {
		let xi = 0;
		for (let i = 0; i < this.C; i++) {
			if (this.weights[i] == 0) {
				continue;
			}

			this.weights[i] = this.weights[i] * this.modelClass[i].conditionalDistribution(e);
			xi += this.weights[i];
		}

		Util.assert(xi != 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);

		for (let i = 0; i < this.C; i++) {
			this.weights[i] /= xi;
		}
	}

	perform(a) {
		for (let i = 0; i < this.C; i++) {
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

	save() {
		this.saved_weights = [...this.weights];
		for (let i = 0; i < this.C; i++) {
			this.modelClass[i].save();
		}
	}

	load() {
		this.weights = [...this.saved_weights];
		for (let i = 0; i < this.C; i++) {
			this.modelClass[i].load();
		}
	}

	get(nu) {
		return this.modelClass[nu];
	}
}
