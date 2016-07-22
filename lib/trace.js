class Trace {
	constructor(t) {
		this.states = new Array(t);
		this.actions = new Array(t);
		this.observations = new Array(t);
		this.rewards = new Array(t);
		this.models = new Array(t);
		this.total_reward = 0;
		this.t = t;
		this.iter = 0;
	}

	logState(env) {
		this.states[this.iter] = env.getState();
	}

	logAction(a) {
		this.actions[this.iter] = a;
	}

	logPercept(e) {
		this.observations[this.iter] = e.obs;
		this.total_reward += e.rew;
		this.rewards[this.iter] = this.total_reward;
	}

	logModel(agent) {
		return;
	}

	log(agent, env, a, e) {
		this.logModel(agent);
		this.logState(env);
		this.logAction(a);
		this.logPercept(e);
		Util.logProgress(this.iter, this.t);
		this.iter++;
	}
}

class TabularTrace extends Trace {
	constructor(t) {
		super(t);
		this.q_map = [];
		this.jumps = 50;
	}

	logModel(agent) {
		this.models[this.iter] = agent.last_q;
		if (agent.lifetime % (this.t / this.jumps) == 0) {
			this.q_map.push(agent.Q.copy());
		}
	}
}

class BayesTrace extends Trace {
	constructor(t) {
		super(t);
		this.ig = new Array(t);
		this.total_information = 0;
	}

	logModel(agent) {
		this.total_information += agent.information_gain;
		this.ig[this.iter] = this.total_information;
		this.models[this.iter] = Util.arrayCopy(agent.model.weights);
	}
}

class ThompsonTrace extends BayesTrace {
	constructor(t) {
		super(t);
		this.rhos = [];
	}

	logModel(agent) {
		super.logModel(agent);
		let goal = agent.rho.goals[0];
		this.rhos.push({ x: goal.x, y: goal.y });
	}
}
