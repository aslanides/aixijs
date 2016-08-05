class CTNode {
	constructor() {
		this.children = [null, null];
		this.counts = [0, 0];
		this.log_prob = 0;
		this.log_prob_w = 0;
	}

	size() {
		var s  = 1;
		s += this[0] ? this[0].size() : 0;
		s += this[1] ? this[1].size() : 0;
		return s;
	}

	visits() {
		return this.counts[0] + this.counts[1];
	}

	_logKTMul(sym) {
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
		this.log_prob += this._logKTMul(sym);
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
		if (sym.length == undefined) {
			this._update(sym);
		} else {
			for (var i = 0; i < sym.length; i++) {
				this._update(sym[i]);
			}
		}
	}

	_update(sym) {
		var contextPath = [];
		var current = this.root;
		this.walkAndGeneratePath(0, contextPath, current);
		while (contextPath.length > 0) {
			current.update(sym);
			current = contextPath.pop();
		}

		current.update(sym);
		this.updateHistory(sym);
	}

	updateHistory(sym) {
		if (sym.length == undefined) {
			this.history.push(sym);
		} else {
			for (var i = 0; i < sym.length; i++) {
				this.history.push(sym[i]);
			}
		}
	}

	walkAndGeneratePath(bitFix, contextPath, current) {
		var traverseDepth = 0;
		var curHistorySym;
		var h = this.history.length;
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
		var contextPath = [];
		var current = this.root;
		var curDepth = this.depth;
		var h = this.history.length;
		this.walkAndGeneratePath(-1, contextPath, current);
		while (contextPath.length > 0) {
			current.revert(this.history[h - 1]);
			if (current.counts[0] == 0 && current.counts[1] == 0) {
				for (var i = 0; i < 2; i++) {
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
		var lastLogBlockProb = logBlockProbability();
		this.update(sym);
		var newLogBlockProb = logBlockProbability();
		var probLogNextBit = newLogBlockProb - lastLogBlockProb;

		return probLogNextBit;
	}

	getLogProbNextSymbolGivenH(sym) {
		var probLogNextBit = this.getLogProbNextSymbolGivenHWithUpdate(sym);
		this.revert();
		this.revertHistory(this.history.length - 1);

		return probLogNextBit;
	}

	genRandomSymbols(symbols, bits) {
		this.genRandomSymbolsAndUpdate(symbols, bits);
		for (var i = 0; i < bits; i++)
						this.revert();
	}

	genRandomSymbolsAndUpdate(symbols, bits) {
		var probNextBit;
		var sym;
		for (var i = 0; i < bits; i++) {
			probNextBit = Math.pow(2, this.getLogProbNextSymbolGivenH(0));
			sym = (Math.random() > probNextBit);
			this.update(sym);
			symbols[i] = sym;
		}
	}

	logBlockProbability() {
		return this.root.logProbWeighted();
	}

	nthHistorySymbol(n) {
		return n < this.history.length ? this.history[n] : null;
	}
}

class CTW {
	constructor(depth, perceptBits) {
		this.ct = new ContextTree(depth);
		this.perceptBits = perceptBits;
	}

	generatePercept() {
		return;
	}

	update(a, e) {
		return;
	}

	encode() {
		return;
	}

	decode() {
		return;
	}
}
