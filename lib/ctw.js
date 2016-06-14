class CTNode {
	constructor() {
		this.children = {
			0: null,
			1: null
		}
		this.counts = {
			0: 0,
			1: 0
		}
		this.log_prob = 0
		this.log_prob_w = 0
	}
	size() {
		var s  = 1
		s += this[0] ? this[0].size() : 0
		s += this[1] ? this[1].size() : 0
		return s
	}
	_logKTMul(sym) {
		return Math.log2((this.counts[sym] + 0.5) / (this.counts[0] + this.counts[1] + 1))
	}
	updateLogProb() {
		this.log_prob_w = this.log_prob - // todo
	}
	update(sym) {
		this.log_prob += this._logKTMul(sym)
		this.children[sym]++
		this.updateLogProb()
	}
	revert(sym) {
		this.count[sym]--
		if (this.count[0] == 0 && this.count[1] == 0) {
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
		this.history.clear()
		this.root = new CTNode()
	}
	update(sym) {
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
		this.history.push(sym)
	}
	walkAndGeneratePath(bit_fix,context_path,current) {
		var traverse_depth = 0
		var cur_history_sym
		while (traverse_depth < this.depth) {
			cur_history_sym = 
		}
	}
}
