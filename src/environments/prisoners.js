class IteratedPrisonersDilemma extends Environment {
	constructor(options) {
		super(options);
		this.opponent = new options.opponent();
		this.payouts = options._payouts;
		this.min_reward = this.payouts[1][0];
		this.max_reward = this.payouts[0][1];
		this.actions = ['defect', 'cooperate'];
		this.numActions = this.actions.length;
		this.a = 1;
		this.b = 1;
		this.noop = 1;
	}

	perform(a) {
		Util.assert(a == 0 || a == 1, `Bad action: ${a}`);
		let b = this.opponent.selectAction();
		let r = this.payouts[b][a];
		this.a = a;
		this.b = b;

		this.opponent.update(a, r);
	}

	generatePercept() {
		// 0 = defect, 1 = cooperate
		return {
			obs: this.b,
			rew: this.payouts[this.a][this.b],
		};
	}

	conditionalDistribution(e) {
		let r = e.rew;
		let o = e.obs;
		let p = this.opponent.pr(o);
		return p;
	}

	save() {
		this.opponent.save();
		this.state = { a: this.a, b: this.b };
	}

	load() {
		this.a = this.state.a;
		this.b = this.state.b;
		this.opponent.load();
	}

	getState() {
		return {
			a: this.a,
			b: this.b,
			payout: this.payouts[this.a][this.b],
		};
	}

	makeModel(kind) {
		let opponents = IteratedPrisonersDilemma.opponents;
		let modelClass = [];
		let opt = Util.deepCopy(this.options);
		for (let op in IteratedPrisonersDilemma.opponents) {
			opt.opponent = IteratedPrisonersDilemma.opponents[op];
			modelClass.push(new this.constructor(opt));
		}

		let C = modelClass.length;
		let modelWeights = Util.zeros(C);
		for (let i = 0; i < C; i++) {
			modelWeights[i] = 1 / C;
		}

		return new BayesMixture(modelClass, modelWeights);
	}
}

class PDAgent {
	pr(b) {
		return 0.5;
	}

	update() {
		return;
	}

	save() {
		return;
	}

	load() {
		return;
	}
}

class AlwaysCooperate extends PDAgent {
	selectAction() {
		return 1;
	}

	pr(b) {
		return b == 0 ? 0 : 1;
	}
}

class AlwaysDefect extends PDAgent {
	selectAction() {
		return 0;
	}

	pr(b) {
		return b == 0 ? 1 : 0;
	}
}

class Random extends PDAgent {
	selectAction() {
		return (Math.random() < 0.5) ? 1 : 0;
	}

	pr(b) {
		return 0.5;
	}
}

class TitForTat extends PDAgent {
	constructor() {
		super();
		this.last_a = 1;
	}

	selectAction() {
		return this.last_a;
	}

	update(a, e) {
		this.last_a = a;
	}

	pr(b) {
		return b == this.last_a ? 1 : 0;
	}

	save() {
		this.state = { a: this.last_a };
	}

	load() {
		this.last_a = this.state.a;
	}
}

class SuspiciousTitForTat extends TitForTat {
	constructor() {
		super();
		this.last_a = 0;
	}
}

class TitForTwoTats extends PDAgent {
	constructor() {
		super();
		this.last_a = 1;
		this.last_a2 = null;
		this.b = 1;
	}

	update(a, e) {
		if (this.last_a == 0 && a == 0) {
			this.b = 0;
		} else {
			this.b = 1;
		}

		this.last_a2 = this.last_a;
		this.last_a = a;

	}

	selectAction() {
		return this.b;
	}

	pr(b) {
		if (b == 0) {
			return this.last_a == 0 && this.last_a2 == 0 ? 1 : 0;
		} else {
			return this.last_a == 0 && this.last_a2 == 0 ? 0 : 1;
		}
	}

	save() {
		this.state = {
			last_a: this.last_a,
			last_a2: this.last_a2,
			b: this.b,
		};
	}

	load() {
		this.last_a = this.state.last_a;
		this.last_a2 = this.state.last_a2;
		this.b = this.state.b;
	}
}

class Pavlov extends PDAgent {
	constructor() {
		super();
		this.last_a = 1;
		this.last_b = 1;
	}

	update(a, e) {
		this.last_a = a;
	}

	selectAction() {
		let b = Math.random() < 0.5 ? 1 : 0;
		if (this.last_a) {
			b = this.last_b;
		}

		this.last_b = b;
		return b;
	}

	pr(b) {
		if (this.last_a) {
			return b == this.last_b ? 1 : 0;
		} else {
			return 0.5;
		}
	}

	save() {
		this.state = {
			a: this.last_a,
			b: this.last_b,
		};
	}

	load() {
		this.last_a = this.state.a;
		this.last_b = this.state.b;
	}
}

class Adaptive extends PDAgent {
	constructor() {
		super();
		this.T = 0;
		this.opening = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
		this.payout_totals = [0, 0];
		this.last_b = 1;
	}

	update(a, e) {
		this.T++;
		this.nc += this.last_b;
		this.nd += 1 - this.last_b;
		this.payout_totals[this.last_b] += e;
	}

	selectAction() {
		if (this.T < 10) {
			return this.opening[this.T];
		}

		let b = this.payout_totals[0] / this.nd > this.payout_totals[1] / this.nc ? 0 : 1;
		this.last_b = b;
		return b;
	}

	pr(b) {
		return 0.5; // too lazy to model this guy :P
	}

	save() {
		this.state = {
			T: this.T,
			payout_totals: [...this.payout_totals],
			b: this.last_b,
		};
	}

	load() {
		this.last_b = this.state.b;
		this.payout_totals = [...this.state.payout_totals];
		this.T = this.state.T;
	}
}

class Grudger extends PDAgent {
	constructor() {
		super();
		this.b = 1;
	}

	update(a) {
		if (a == 0) {
			this.b = 0;
		}
	}

	selectAction() {
		return this.b;
	}

	pr(b) {
		return b == this.b ? 1 : 0;
	}

	save() {
		this.state = { b: this.b };
	}

	load() {
		this.b = this.state.b;
	}
}

class Gradual extends PDAgent {
	constructor() {
		super();
		this.n = 0;
		this.nd = 0;
		this.last_nd = 0;
		this.coop_count = 0;
		this.b = 1;
	}

	update(a) {
		if (a == 0) {
			this.b = 0;
			this.nd++;
		}
	}

	selectAction() {
		if (this.b) {
			return 1;
		}

		if (this.n < this.nd) {
			this.n++;
			return 0;
		}

		if (this.coop_count == 0) {
			this.coop_count++;
			return 1;
		}

		this.n = 0;
		this.coop_count = 0;
		return 1;
	}

	pr(b) {
		return 0.5; // lazy
	}

	save() {
		this.state = {
			n: this.n,
			nd: this.nd,
			last_nd: this.last_nd,
			coop_count: this.coop_count,
			b: this.b,
		};
	}

	load() {
		this.n = this.state.n;
		this.nd = this.state.nd;
		this.last_nd = this.state.last_nd;
		this.coop_count = this.state.coop_count;
		this.b = this.state.b;
	}
}

IteratedPrisonersDilemma.opponents = {
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
};

IteratedPrisonersDilemma.params = [
	{
		field: 'opponent',
		value: AlwaysCooperate,
	},
];
