class Trace {
	constructor(t) {
		this.states = [];
		this.actions = [];
		this.observations = [];
		this.rewards = [];
		this.averageReward = [];
		this.models = [];
		this.totalReward = 0;
		this.t = t;
		this.iter = 0;
	}

	logState(env) {
		this.states.push(env.getState());
	}

	logAction(a) {
		this.actions.push(a);
	}

	logPercept(e) {
		this.observations.push(e.obs);
		this.totalReward += e.rew;
		this.rewards.push(this.totalReward);
		this.averageReward.push(this.totalReward / (this.iter + 1));
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
		this.plots = [RewardPlot];
	}

	logModel(agent) {
		this.models.push(agent.last_q);
		if (agent.lifetime % (this.t / this.jumps) == 0) {
			this.q_map.push(agent.Q.copy());
		}
	}
}

class BayesTrace extends Trace {
	constructor(t) {
		super(t);
		this.ig = [];
		this.totalInformation = 0;
		this.plots = [RewardPlot, IGPlot];
	}

	logModel(agent) {
		this.totalInformation += agent.information_gain;
		this.ig.push(this.totalInformation);
		this.models.push(Util.arrayCopy(agent.model.weights));
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
