class PDAgent extends Agent {
	pr(b) {
		return 1;
	}
}

class AlwaysCooperate extends PDAgent {
	selectAction() {
		return 1;
	}
}

class AlwaysDefect extends PDAgent {
	selectAction() {
		return 0;
	}
}

class Random extends PDAgent {
	selectAction() {
		return (Math.random() < 0.5);
	}

	pr(b) {
		return 0.5;
	}
}

class TitForTat extends PDAgent {
	constructor() {
		this.last_a = 1;
	}

	selectAction() {
		return this.last_a;
	}

	update(a, e) {
		this.last_a = a;
	}
}

class SuspiciousTitForTat extends TitForTat {
	constructor() {
		this.last_a = 0;
	}
}

class TitForTwoTats extends PDAgent {
	constructor() {
		this.last_a = 1;
		this.b = 1;
	}

	update(a, e) {
		if (this.last_a == 0 && a == 0) {
			this.b = 0;
		} else {
			this.b = 1;
		}
	}

	selectAction() {
		return this.b;
	}
}

class Pavlov extends PDAgent {
	constructor() {
		this.last_a = 1;
		this.last_b = 1;
	}

	update(a, e) {
		this.last_a = a;
	}

	selectAction() {
		let b = 0;
		if (this.last_a) {
			b = this.last_b;
		}

		this.last_b = b;
		return b;
	}
}

class Adaptive extends PDAgent {
	constructor() {
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
}

class Grudger extends PDAgent {
	constructor() {
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
}

class Gradual extends PDAgent {
	constructor() {
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
}
