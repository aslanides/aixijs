class SquareKSA extends BayesAgent {
	utility(percept) {
		return -1 * this.model.xi(percept);
	}
}

class ShannonKSA extends BayesAgent {
	utility(percept) {
		return -1 * Math.log2(this.model.xi(percept));
	}
}

class KullbackLeiblerKSA extends BayesAgent {
	utility(percept) {
		return -1 * Util.entropy(this.model.weights);
	}
}

// TODO add discounts here
