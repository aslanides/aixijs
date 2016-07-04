class CTNode {
	constructor() {
		this.children = [null,null]
		this.counts = [0,0]
		this.log_prob = 0
		this.log_prob_w = 0
	}
	size() {
		var s  = 1
		s += this[0] ? this[0].size() : 0
		s += this[1] ? this[1].size() : 0
		return s
	}
	visits() {
		return this.counts[0] + this.counts[1]
	}
	_logKTMul(sym) {
		return Math.log2((this.counts[sym] + 0.5) / (this.counts[0] + this.counts[1] + 1))
	}
	updateLogProb() {
		if (this.children[0] == null) {
			if (this.children[1] == null) {
				this.log_prob_w = this.log_prob
			} else {
				this.log_prob_w = Math.log2(
					Math.pow(2,this.log_prob - this.children[1].log_prob_w) + 1)
					+ this.children[1].log_prob_w - 1
			}
		} else {
			if (this.children[1] == null) {
				this.log_prob_w = Math.log2(
					Math.pow(2,this.log_prob - this.children[0].log_prob_w) + 1)
					+ this.children[0].log_prob_w - 1
				)
	        } else {
				this.log_prob_w = Math.log2(
					Math.pow(2,this.log_prob - this.children[0].log_prob_w - this.children[1].log_prob_w) + 1)
					+ this.children[0].log_prob_w + this.children[1].log_prob_w - 1
	        }
		}
	}
	update(sym) {
		this.log_prob += this._logKTMul(sym)
		this.counts[sym]++
		this.updateLogProb()
	}
	revert(sym) {
		this.counts[sym]--
		if (this.counts[0] == 0 && this.counts[1] == 0) {
			return
		}
		this.log_prob -= this.logKTMul(sym)
		this.updateLogProb()
	}
}

class ContextTree {
	constructor(depth) {
		this.root = new CTNode()
		this.depth = depth
		this.history = []
	}
	resetHistory() {
		this.history = this.history.slice(this.history.length - this.depth,this.history.length)
	}
	clear() {
		this.history = []
		this.root = new CTNode()
	}
	update(sym) {
		if (sym.length == undefined) {
			this._update(sym)
		} else {
			for (var i = 0;i < sym.length; i++) {
				this._update(sym[i])
			}
		}
	}
	_update(sym) {
		var context_path = []
		var current = this.root
		this.walkAndGeneratePath(0,context_path,current)
		while (context_path.length > 0) {
			current.update(sym)
			current = context_path.pop()
		}
		current.update(sym)
		this.updateHistory(sym)
	}
	updateHistory(sym) {
		if (sym.length == undefined) {
			this.history.push(sym)
		} else {
			for (var i = 0; i < sym.length; i++) {
				this.history.push(sym[i])
			}
		}
	}
	walkAndGeneratePath(bit_fix,context_path,current) {
		var traverse_depth = 0
		var cur_history_sym
		var h = this.history.length
		while (traverse_depth < this.depth) {
			cur_history_sym = this.history[bit_fix + h - 1 - traverse_depth]

			if (current.children[cur_history_sym] == null) {
				current.children[cur_history_sym] = new CTNode()
			}
			context_path.push(current)
			current = current.children[cur_history_sym]
	        traverse_depth++
		}
	}
	revert() {
		var context_path = []
		var current = this.root
		var cur_depth = this.depth
		var h = this.history.length
	    this.walkAndGeneratePath(-1, context_path, current)
		while (context_path.length > 0) {
			current.revert(this.history[h-1])
			if (current.counts[0] == 0 && current.counts[1] == 0) {
				for (var i = 0; i < 2; i++) {
					current.children[i] = null
					current.counts = 0
				}
				current = context_path.pop()
				current.children[this.history[h - cur_depth - 1]] = null
			} else {
				current = context_path.pop()
			}
			cur_depth--
		}
		current.revert(this.history[h-1])
	}
	revertHistory(newsize) {
		Util.assert(newsize <= this.history.length)
	    while (this.history.length > newsize)
	        this.history.pop()
	}
	getLogProbNextSymbolGivenHWithUpdate(sym) {
	    var last_log_block_prob = logBlockProbability()
	    this.update(sym)
	    var new_log_block_prob = logBlockProbability()
	    var prob_log_next_bit = new_log_block_prob - last_log_block_prob;

	    return prob_log_next_bit
	}
	getLogProbNextSymbolGivenH(sym) {
	    var prob_log_next_bit = this.getLogProbNextSymbolGivenHWithUpdate(sym)
	    this.revert()
	    this.revertHistory(this.history.length - 1)

	    return prob_log_next_bit
	}
	genRandomSymbols(symbols,bits) {
	    this.genRandomSymbolsAndUpdate(symbols,bits)
	    for (var i = 0; i < bits; i++)
	        this.revert();
	}
	genRandomSymbolsAndUpdate(symbols,bits) {
	    var prob_next_bit
	    var sym
	    for (var i = 0; i < bits; i++) {
	        prob_next_bit = Math.pow(2, this.getLogProbNextSymbolGivenH(0))
	        sym = (Math.random() > prob_next_bit)
	        this.update(sym)
	        symbols[i] = sym
	    }
	}
	logBlockProbability() {
	    return this.root.logProbWeighted()
	}
	nthHistorySymbol(n) {
	    return n < this.history.length ? this.history[n] : null;
	}
}
