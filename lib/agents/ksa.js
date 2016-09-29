class SquareKSA extends BayesAgent {
	utility(e) {
		return -1 * this.model.xi(e);
	}
}

class ShannonKSA extends BayesAgent {
	utility(e) {
		return -1 * Math.log2(this.model.xi(e));
	}
}

class KullbackLeiblerKSA extends BayesAgent {
	utility(e) {
		return -1 * Util.entropy(this.model.weights);
	}
}

// TODO add discounts here
