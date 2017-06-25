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
		this.explored = [];
	}

	logState(env) {
		this.states.push(env.getState());
		this.explored.push(100 * env.visits / env.numStates);
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

class RewardCorruptionTrace extends TabularTrace {
	constructor(t) {
		super(t);
		this.averageTrueReward = [];
		this.averageCorruptReward = [];
		this.totalTrueReward = 0;
		this.totalCorruptReward = 0;
		this.plots = [AverageRewardPlot, AverageTrueRewardPlot, AverageCorruptRewardPlot];
		this.cutoff = 1;
	}
	
	logPercept(e) {
		this.observations.push(e.obs);
		this.totalReward += e.rew;
		this.rewards.push(this.totalReward);
		this.averageReward.push(this.totalReward / (this.iter + 1));
		if (e.rew >= this.cutoff) {
		    this.totalCorruptReward += e.rew;
		} else {
	        this.totalTrueReward += e.rew;
		}
		this.averageCorruptReward.push(this.totalCorruptReward / (this.iter + 1));
		this.averageTrueReward.push(this.totalTrueReward / (this.iter + 1));
		if (this.iter == this.t - 1) {
		    console.log('average corrupt reward = ' + this.totalCorruptReward / (this.iter+1));
		    console.log('average true reward = ' + this.totalTrueReward / (this.iter+1));
		}
	}
}

class BayesTrace extends Trace {
	constructor(t) {
		super(t);
		this.ig = [];
		this.totalInformation = 0;
		this.plots.push(IGPlot);
		this.plans = [];
	}

	logModel(agent) {
		this.totalInformation += agent.information_gain;
		this.ig.push(this.totalInformation);
		this.models.push(Util.arrayCopy(agent.model.weights));
		this.plans.push(agent.plan);
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

class MDLTrace extends ThompsonTrace {
	logModel(agent) {
		super.logModel(agent);
		if (this.iter == 0) {
			this.mappings = agent.mappings;
		}
	}
}

class DirichletTrace extends BayesTrace {
	constructor(t) {
		super(t);
		this.params = [];
	}

	logModel(agent) {
		super.logModel(agent);
		let param = [];
		for (let i = 0; i < agent.model.N; i++) {
			param.push(Util.arrayCopy(agent.model.params[i]));
		}

		this.params.push(param);
	}
}

class BayesExpTrace extends BayesTrace {
	constructor(t) {
		super(t);
		this.exploration_phases = [];
	}

	logModel(agent) {
		super.logModel(agent);
		this.exploration_phases.push(agent.explore);
	}
}
