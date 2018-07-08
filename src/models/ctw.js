class CTW {
	constructor(options) {
		this.actionBits = options.actionBits;
		this.obsBits = options.obsBits;
		this.rewBits = options.rewBits;
		this.depth = options.depth;
		this.perceptBits = this.obsBits + this.rewBits;
		this.step = 0;
		this.weights = Util.zeros(1);
		this.saved_weights = [...this.weights];

		this.ct = new ContextTree(this.depth);
	}

	generatePercept() {
		let symbols = new Array(this.perceptBits);
		this.ct.genRandomSymbolsAndUpdate(symbols, this.perceptBits);
		let obs = Util.decode(symbols, this.obsBits);
		for (let i = 0; i < this.rewBits; i++) {
			symbols[i] = symbols[i + this.obsBits]; // TODO: ???
		}

		let rew = Util.decode(symbols, this.rewBits);
		rew += this.minReward;
		return { obs: obs, rew: rew };
	}

	conditionalDistribution(e) {
		let obs = e.obs;
		let rew = e.rew - this.minReward;
		let logProb = 0;
		for (let i = 0; i < this.obsBits; i++) {
			logProb += this.ct.getLogProbNextSymbolGivenHWithUpdate(1 & obs);
			obs /= 2;
		}

		for (let i = 0; i < this.rewBits; i++) {
			logProb += this.ct.getLogProbNextSymbolGivenHWithUpdate(1 & rew);
			rew /= 2;
		}

		return Math.pow(2, logProb);
	}

	perform(a) {
		let symbols = [];
		Util.encode(symbols, a, this.actionBits);
		this.ct.updateHistory(symbols);
		this.step++;
	}

	update(a, e) {
		this.perform(a);
		this.bayesUpdate(a, e);
	}

	bayesUpdate(a, e) {
		let rew = e.rew - this.minReward;
		let symbols = [];
		Util.encode(symbols, e.obs, this.obsBits);
		Util.encode(symbols, e.rew, this.rewBits);

		if (this.ct.history.length >= this.ct.depth) {
			this.ct.update(symbols);
		} else {
			this.ct.updateHistory(symbols);
		}

		this.step++;
	}

	save() {
		this.saved_step = this.step;
	}

	load() {
		let n = this.step - this.saved_step;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this.perceptBits; j++) {
				this.ct.revert();
				this.ct.revertHistory(this.ct.history.length - 1);
			}

			this.ct.revertHistory(this.ct.history.length - this.actionBits);
		}
	}
}

class ContextTree {
	constructor(depth) {
		this.root = new CTNode();
		this.depth = depth;
		this.history = [];
	}

	resetHistory() {
		this.history = this.history.slice(this.history.length - this.depth, this.history.length);
	}

	clear() {
		this.history = [];
		this.root = new CTNode();
	}

	update(sym) {
		if (!sym.length) {
			this._update(sym);
		} else {
			for (let i = 0; i < sym.length; i++) {
				this._update(sym[i]);
			}
		}
	}

	_update(sym) {
		let contextPath = [];
		let current = this.root;
		this.walkAndGeneratePath(0, contextPath, current);
		while (contextPath.length > 0) {
			current.update(sym);
			current = contextPath.pop();
		}

		current.update(sym);
		this.updateHistory(sym);
	}

	updateHistory(sym) {
		if (!sym.length) {
			this.history.push(sym);
		} else {
			for (let i = 0; i < sym.length; i++) {
				this.history.push(sym[i]);
			}
		}
	}

	walkAndGeneratePath(bitFix, contextPath, current) {
		let traverseDepth = 0;
		let curHistorySym;
		let h = this.history.length;
		while (traverseDepth < this.depth) {
			curHistorySym = this.history[bitFix + h - 1 - traverseDepth];

			if (current.children[curHistorySym] == null) {
				current.children[curHistorySym] = new CTNode();
			}

			contextPath.push(current);
			current = current.children[curHistorySym];
			traverseDepth++;
		}
	}

	revert() {
		let contextPath = [];
		let current = this.root;
		let curDepth = this.depth;
		let h = this.history.length;
		this.walkAndGeneratePath(-1, contextPath, current);
		while (contextPath.length > 0) {
			current.revert(this.history[h - 1]);
			if (current.counts[0] == 0 && current.counts[1] == 0) {
				for (let i = 0; i < 2; i++) {
					current.children[i] = null;
					current.counts = 0;
				}

				current = contextPath.pop();
				current.children[this.history[h - curDepth - 1]] = null;
			} else {
				current = contextPath.pop();
			}

			curDepth--;
		}

		current.revert(this.history[h - 1]);
	}

	revertHistory(newsize) {
		Util.assert(newsize <= this.history.length);
		while (this.history.length > newsize)
			this.history.pop();
	}

	getLogProbNextSymbolGivenHWithUpdate(sym) {
		let lastLogBlockProb = this.logBlockProbability();
		this.update(sym);
		let newLogBlockProb = this.logBlockProbability();
		let probLogNextBit = newLogBlockProb - lastLogBlockProb;

		return probLogNextBit;
	}

	getLogProbNextSymbolGivenH(sym) {
		let probLogNextBit = this.getLogProbNextSymbolGivenHWithUpdate(sym);
		this.revert();
		this.revertHistory(this.history.length - 1);

		return probLogNextBit;
	}

	genRandomSymbols(symbols, bits) {
		this.genRandomSymbolsAndUpdate(symbols, bits);
		for (let i = 0; i < bits; i++) {
			this.revert();
		}
	}

	genRandomSymbolsAndUpdate(symbols, bits) {
		let probNextBit;
		let sym;
		for (let i = 0; i < bits; i++) {
			probNextBit = Math.pow(2, this.getLogProbNextSymbolGivenH(0));
			sym = (Math.random() > probNextBit);
			this.update(sym);
			symbols[i] = sym;
		}
	}

	logBlockProbability() {
		return this.root.log_prob_w;
	}

	nthHistorySymbol(n) {
		return n < this.history.length ? this.history[n] : null;
	}
}

class CTNode {
	constructor() {
		this.children = [null, null];
		this.counts = [0, 0];
		this.log_prob = 0;
		this.log_prob_w = 0;
	}

	size() {
		let s = 1;
		s += this[0] ? this[0].size() : 0;
		s += this[1] ? this[1].size() : 0;
		return s;
	}

	visits() {
		return this.counts[0] + this.counts[1];
	}

	logKTMul(sym) {
		return Math.log2((this.counts[sym] + 0.5) / (this.counts[0] + this.counts[1] + 1));
	}

	updateLogProb() {
		if (this.children[0] == null) {
			if (this.children[1] == null) {
				this.log_prob_w = this.log_prob;
			} else {
				this.log_prob_w = Math.log2(
					Math.pow(2, this.log_prob - this.children[1].log_prob_w) + 1)
					+ this.children[1].log_prob_w - 1;
			}
		} else {
			if (this.children[1] == null) {
				this.log_prob_w = Math.log2(
					Math.pow(2, this.log_prob - this.children[0].log_prob_w) + 1)
					+ this.children[0].log_prob_w - 1;
			} else {
				this.log_prob_w = Math.log2(
					Math.pow(2, this.log_prob - this.children[0].log_prob_w - this.children[1].log_prob_w) + 1)
					+ this.children[0].log_prob_w + this.children[1].log_prob_w - 1;
			}
		}
	}

	update(sym) {
		this.log_prob += this.logKTMul(sym);
		this.counts[sym]++;
		this.updateLogProb();
	}

	revert(sym) {
		this.counts[sym]--;
		if (this.counts[0] == 0 && this.counts[1] == 0) {
			return;
		}

		this.log_prob -= this.logKTMul(sym);
		this.updateLogProb();
	}
}
