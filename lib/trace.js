class Trace {
    constructor() {
		this.states = []
		this.actions = []
		this.observations = []
		this.rewards = []
		this.models = []
		this.total_reward = 0
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
	logModel(agent) {
		throw "Not implemented"
	}
	log(agent,env,a,e) {
		this.logModel(agent)
		this.logState(env)
		this.logAction(a)
		this.logPercept(e)
	}
}

class TabularTrace extends Trace {
	constructor(t) {
		super()
		this.t = t
		this.q_map = []
	}
	logModel(agent) {
		this.models.push(agent.last_q)
		if (agent.lifetime % (this.t/50) == 0){
			this.q_map.push(agent.Q.copy())
		}
	}
}

class BayesTrace extends Trace {
	constructor() {
		super()
		this.ig = []
	}
	logModel(agent) {
		this.models.push(Util.arrayCopy(agent.model.weights))
		this.ig.push(agent.information_gain)
	}
}

class ThompsonTrace extends BayesTrace {
	constructor() {
		super()
		this.rhos = []
	}
	// TODO: generalize
	logModel(agent) {
		super.logModel(agent)
		var dis = agent.rho.dispenser
		this.rhos.push({x:dis.x,y:dis.y})
	}
}
