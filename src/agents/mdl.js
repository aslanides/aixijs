class MDLAgent extends BayesAgent {
	constructor(options) {
		super(options);
		this.tracer = MDLTrace;
		let C = this.model.modelClass.length;
		for (let i = 0; i < C; i++) {
			this.model.modelClass[i].idx = i;
		}

		let len = model => JSON.stringify(model.options).length;

		this.model.modelClass.sort((m, n) => {
			let d = len(m) - len(n);
			return d || m.idx - n.idx;
		});

		let w = [...this.model.weights];
		for (let i = 0; i < C; i++) {
			let m = this.model.modelClass[i];
			w[i] = this.model.weights[m.idx];
		}

		this.model.weights = w;
		this.idx = 0;
		this.rho = this.model.modelClass[this.idx].copy();
		this.rho.bayesUpdate = function () { };

		this.planner = new ExpectimaxTree(this, this.rho);

		this.mappings = [];
		for (let i = 0; i < C; i++) {
			this.mappings[i] = this.model.modelClass[i].idx;
		}

	}

	update(a, e) {
		super.update(a, e);
		this.rho.perform(a);
		if (this.model.weights[this.idx] != 0) {
			return;
		}

		for (; this.idx < this.model.modelClass.length; this.idx++) {
			if (this.model.weights[this.idx] != 0) {
				this.rho = this.model.modelClass[this.idx].copy();
				this.rho.bayesUpdate = function () { };

				this.rho.idx = this.idx;

				this.planner = new ExpectimaxTree(this, this.rho);
				return;
			}
		}

		// we shouldn't get here
		throw 'Cromwell violation! Agent is in Bayes Hell!';
	}
}
