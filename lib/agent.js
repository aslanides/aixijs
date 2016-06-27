class Agent {
    constructor(options) {
        this.epsilon = options.epsilon
        this.gamma = options.gamma
        this.alpha = options.alpha
        this.num_actions = options.num_actions
		this.lifetime = 0
    }
    selectAction(e) {
        throw "Not implemented!"
    }
    update(a,e) {
        throw "Not implemented!"
    }
    utility(e) {
        return e.rew // default for RL agents
    }
	getModel() {
		throw "Not implemented"
	}
}

class RandomAgent extends Agent {
	constructor(options) {
		super(options)
		this.tracer = Trace
	}
    selectAction(e) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(a,e) {}
}

class TabularAgent extends Agent {
    constructor(options) {
        super(options)
        this.Q = new QTable()
		this.tracer = TabularTrace
		this.last_q = 0
		this.last_o = options.initial_obs
    }
    selectAction(e) {
		this.lifetime++
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        }
		return this.argmax(e.obs)
    }
    argmax(obs) {
        var Q_max = Number.NEGATIVE_INFINITY
        var ties = []
        var Qtmp
        for (var a = 0; a < this.num_actions; a++) {
            Qtmp = this.Q.get(obs,a)
            if (Qtmp < Q_max) {
                continue
            } else if (Qtmp > Q_max) {
                ties = [a]
                Q_max = Qtmp
            } else {
                ties.push(a)
            }
        }
        return Util.randomChoice(ties)
    }
    update(a,e) {
        var Q_old = this.Q.get(this.last_o,a)
        var Q_new = Q_old +
            this.alpha*(
                e.rew + this.gamma*this.Q.get(e.obs,this.TDUpdate(e)) - Q_old
            )
        this.Q.set(this.last_o,a,Q_new)
		this.last_q = Q_new
		this.last_o = e.obs
    }
	TDUpdate(e) {
		throw "not implemented"
	}
}

class QLearn extends TabularAgent {
	TDUpdate(e) {
		return this.argmax(e.obs)
	}
}

class SARSA extends TabularAgent {
	TDUpdate(e) {
		return this.selectAction(e)
	}
}

class BayesAgent extends Agent {
    constructor(options) {
        super(options)
        this.model = new BayesMixture(options)
        this.horizon = options.horizon
        this.UCBweight = options.UCBweight
        this.max_reward = rewards.chocolate + rewards.move
        this.min_reward = rewards.wall + rewards.move
        this.samples = options.samples
        this.tracer = BayesTrace
		this.decision_node = RLDecisionNode
		this.search_tree = new ExpectimaxTree(this,this.model)
		this.information_gain = 0
    }
    update(a,e) {
		this.model.save()
        this.model.update(a,e)
		this.information_gain = Util.KLDivergence(this.model.weights,
			this.model.saved_weights)
		var n = this.search_tree.root.getChild(a).getChild(e)
		//this.search_tree.root = n || new this.decision_node()

    }
    selectAction(e) {
		this.search_tree.root = new this.decision_node()
        return this.search_tree.bestAction()
    }
}

class KSA extends BayesAgent {
	constructor(options) {
		super(options)
		this.decision_node = UtilityDecisionNode
	}
}

class SquareKSA extends KSA {
    utility(percept,dfr) {
		return dfr == this.horizon ? -1 * Math.pow(this.model.xi(percept),2) : 0
    }
}

class ShannonKSA extends KSA {
    utility(percept,dfr) {
		return dfr == this.horizon ? Util.entropy(this.model.xi(percept)) : 0
    }
}

class KullbackLeiblerKSA extends KSA {
    utility(percept,dfr) {

    }
}

class ThompsonAgent extends BayesAgent {
    constructor(options) {
        super(options)
        this.T = 0
        this.rho
		this.tracer = ThompsonTrace
		this.thompsonSample()
    }
	thompsonSample() {
		var idx = Util.sample(this.model.weights)
		this.rho = this.model.model_class[idx].copy()
		this.search_tree = new ExpectimaxTree(this,this.rho)
	}
    selectAction(e) {
        if (this.T % this.horizon == 0) {
			this.thompsonSample()
        }
        this.T++
        return this.search_tree.bestAction()
    }
}

class DQN extends Agent {

}

class CNC extends Agent {

}

class TorAgent extends BayesAgent{

}

class MDLAgent extends BayesAgent {

}

class OptimisticAIXI extends BayesAgent {

}

class BayesExp extends BayesAgent {

}
