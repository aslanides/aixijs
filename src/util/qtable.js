class QTable {
	constructor(initialQ, numActions) {
		this.map = new Map();
		this.initialQ = initialQ;
		this.numActions = numActions;
	}

	get(obs, action) {
		var val = this.map.get(obs * this.numActions + action);
		if (val == undefined) {
			return this.initialQ;
		}

		return val;
	}

	set(obs, action, value) {
		this.map.set(obs * this.numActions + action, value);
	}

	copy() {
		var res = new QTable();
		for (var [key, value] of this.map) {
			res.map.set(key, value);
		}

		return res;
	}
}
