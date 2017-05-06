class DirichletMDP {
	constructor(options) {
		this.numStates = options.numStates;
		this.numActions = options.numActions;
		this.transitions = new Array();
		this.params = new Array();
		this.saved_params = new Array();
		this.rewards = new Array(); // deterministic rewards for now
		for (let s = 0; s < this.numStates; s++) {
			this.transitions.push(new Array());
			this.params.push(new Array());
			this.saved_params.push(new Array());
			this.rewards.push(Util.zeros(this.numActions));
			for (let a = 0; a < this.numActions; a++) {
				let alphas = Util.zeros(this.numStates);
				this.params[s].push(alphas);
				this.transitions[s].push(new Dirichlet(alphas));
			}
		}

		this.state = 0;
	}

	update(a, e) {
		this.transitions[this.state][a].update(e.obs);
		this.rewards[this.state][a] = e.rew;
	}

	generatePercept() {
		return {
			obs: this.state,
			rew: this.rewards[this.state][this.last_action],
		};
	}

	perform(a) {
		let P = this.transitions[this.state][a].means();
		this.state = Util.sample(P);
		this.last_action = a;
	}

	save() {
		for (let s = 0; s < this.numStates; s++) {
			for (let a = 0; a < this.numActions; a++) {
				this.saved_params[s][a] = Util.arrayCopy(this.params[s][a]);
			}
		}

		this.saved_state = this.state;

		// don't need to save rewards since they're idempotent
	}

	load() {
		for (let s = 0; s < this.numStates; s++) {
			for (let a = 0; a < this.numActions; a++) {
				this.params[s][a] = Util.arrayCopy(this.saved_params[s][a]);
				this.transitions[s][a].alphas = this.params[s][a];
				this.transitions[s][a].alphaSum = Util.sum(this.params[s][a]);
			}
		}

		this.state = this.saved_state;
	}

}
