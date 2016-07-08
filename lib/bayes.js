class BayesMixture {
	constructor(options) {
		this.modelClass = Util.arrayCopy(options.modelClass);
		this.C = this.modelClass.length;
		this.saved_weights;

		this.weights = Util.zeros(this.C);
		if (options.priorType == 'Uniform') {
			for (let i = 0; i < this.C; i++) {
				this.weights[i] = 1 / (this.C);
			}
		} else if (options.priorType == 'Ockham') {
			throw 'TODO';
		} else if (options.priorType == 'Dogmatic') {
			throw 'TODO';
		} else if (options.priorType == 'Informed') {
			Util.assert(!!options.mu, 'Model index not specified!');
			this.weights[options.mu] = 1;
		} else {
			throw `Unknown prior type: ${options.priorType}.`;
		}

		Util.assert(Math.abs(Util.sum(this.weights) - 1) < 1e-4, 'Prior is not normalised!');
	}

	xi(percept) {
		let s = 0;
		for (let i = 0; i < this.C; i++) {
			if (this.weights[i] == 0) {
				continue;
			}

			s += this.weights[i] * this.modelClass[i].conditionalDistribution(percept);
		}

		Util.assert(s != 0, `The agent's Bayesian mixture assigns 0 probability to the percept
			(${percept.obs},${percept.rew})`);
		return s;
	}

	update(a, e) {
		this.perform(a);
		let xi = this.xi(e);
		for (let i = 0; i < this.C; i++) {
			this.weights[i] = this.weights[i] * this.modelClass[i].conditionalDistribution(e) / xi;
		}
	}

	perform(a) {
		for (let i = 0; i < this.C; i++) {
			this.modelClass[i].perform(a);
		}
	}

	generatePercept() {
		let idx = Util.sample(this.weights);
		return this.modelClass[idx].generatePercept();
	}

	save() {
		this.saved_weights = [...this.weights];
		this.modelClass.forEach(m => m.save());
	}

	load() {
		this.weights = this.saved_weights;
		for (let i = 0; i < this.C; i++) {
			this.modelClass[i].load();
		}
	}

	get(nu) {
		return this.modelClass[nu];
	}
}
