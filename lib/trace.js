class Trace {
    constructor(t) {
		this.states = []
		this.actions = []
		this.observations = []
		this.rewards = []
		this.models = []
		this.total_reward = 0
		this.t = t
		this.iter = 0
    }
	logState(env) {
		this.states.push(env.getState())
	}
	logAction(a) {
		this.actions.push(a)
	}
	logPercept(e) {
		this.observations.push(e.obs)
		this.total_reward += e.rew
		this.rewards.push(this.total_reward)
	}
	logModel(agent) {}
	log(agent,env,a,e) {
		this.logModel(agent)
		this.logState(env)
		this.logAction(a)
		this.logPercept(e)
		Util.logProgress(this.iter,this.t)
		this.iter++
	}
}

class TabularTrace extends Trace {
	constructor(t) {
		super(t)
		this.q_map = []
		this.jumps = 50
	}
	logModel(agent) {
		this.models.push(agent.last_q)
		if (agent.lifetime % (this.t/this.jumps) == 0){
			this.q_map.push(agent.Q.copy())
		}
	}
}

class BayesTrace extends Trace {
	constructor(t) {
		super(t)
		this.ig = []
		this.total_information = 0
	}
	logModel(agent) {
		this.total_information += agent.information_gain
		this.models.push(Util.arrayCopy(agent.model.weights))
		this.ig.push(this.total_information)
	}
}

class ThompsonTrace extends BayesTrace {
	constructor(t) {
		super(t)
		this.rhos = []
	}
	logModel(agent) {
		super.logModel(agent)
		var goal = agent.rho.goal
		this.rhos.push({x:goal.x,y:goal.y})
	}
}
