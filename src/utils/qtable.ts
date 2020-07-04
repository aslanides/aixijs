import { Action } from "../types";

export class QTable {
	// A tabular dictionary for action-values.
	// Assumes that observations are state indices, i.e. integers.

	map: Map<number, number>;  // Dictionary mapping (s, a) -> Q(s, a).
	initialQ: number;  // Initial Q-values.
	numActions: number; // Number of actions in environment.

	constructor(initialQ: number, numActions: number) {
		this.map = new Map();
		this.initialQ = initialQ;
		this.numActions = numActions;
	}

	get(obs: number, action: Action) {
		// Gets Q(s, a).
		const val = this.map.get(obs * this.numActions + action);
		if (val === undefined) {
			return this.initialQ;
		}

		return val;
	}

	set(obs: number, action: Action, value: number) {
		// Sets Q(s, a) = v.
		this.map.set(obs * this.numActions + action, value);
	}

	copy(): QTable {
		// Creates a copy of the Q-table.
		const res = new QTable(this.initialQ, this.numActions);
		for (const [key, value] of this.map) {
			res.map.set(key, value);
		}

		return res;
	}
}
