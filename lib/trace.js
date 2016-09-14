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
		this.plots = [AverageRewardPlot];
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
		this.iter++;
	}

	makePlots() {
		let plots = [];
		Plot.clearAll();
		for (let P of this.plots) {
			plots.push(new P(this));
		}

		return plots;
	}
}

class TabularTrace extends Trace {
	constructor(t) {
		super(t);
		this.q_map = [];
		this.jumps = 50;
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
		this.plots.push(IGPlot);
		this.plan_trace = [];
	}

	logModel(agent) {
		this.totalInformation += agent.information_gain;
		this.ig.push(this.totalInformation);
		this.models.push(Util.arrayCopy(agent.model.weights));
		this.plan_trace.push(agent.current_plan);
	//	console.log(agent.current_plan)
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

class DirichletTrace extends BayesTrace {
	constructor(t) {
		super(t);
		this.params = [];
	}

	logModel(agent) {
		let param = [];
		for (let i = 0; i < agent.model.M; i++) {
			param.push(Util.arrayCopy(agent.model.params[i]));
		}

		this.params.push(param);
	}
}
