class Trace {
    constructor() {
		this.states = []
		this.actions = []
		this.observations = []
		this.rewards = []

		this.models = []

		this.total_reward = 0
    }
	logReward(r) {
		this.total_reward += r
		this.rewards.push(this.total_reward)
	}
	logState(env) {
		this.states.push(env.getState())
	}
	logAction(a) {
		this.actions.push(a)
	}
	logObservation(o) {
		this.observations.push(o)
	}
	logModel(agent) {
		throw "Not implemented"
	}
	log(agent,env,a,o,r) {
		this.logModel(agent)
		this.logState(env)
		this.logAction(a)
		this.logObservation(o)
		this.logReward(r)
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
		var dis = agent.rho.grid.getDispenser()
		this.rhos.push({x:dis.x,y:dis.y})
	}
}
