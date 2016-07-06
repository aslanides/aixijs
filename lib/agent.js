class Agent {
    constructor(options) {
        this.gamma = options.gamma
        this.num_actions = options.num_actions
		this.tracer = Trace
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
}

class RandomAgent extends Agent {
	constructor(options) {
		super(options)
	}
    selectAction(e) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(a,e) {}
}

class TabularAgent extends Agent {
    constructor(options) {
        super(options)
		this.epsilon = options.epsilon
		this.alpha = options.alpha
		this.lifetime = 0
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
        let Q_max = Number.NEGATIVE_INFINITY
        let ties = []
        let Qtmp
        for (let a = 0; a < this.num_actions; a++) {
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
        let Q_old = this.Q.get(this.last_o,a)
        let Q_new = Q_old +
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
        this.max_reward = options.max_reward
        this.min_reward = options.min_reward
        this.samples = options.samples
        this.tracer = BayesTrace
		this.search_tree = new ExpectimaxTree(this,this.model)
		this.information_gain = 0
    }
    update(a,e) {
		this.model.save()
        this.model.update(a,e)
		this.information_gain = Util.KLDivergence(this.model.weights,
			this.model.saved_weights)
		let n = this.search_tree.root.getChild(a).getChild(e)
		//this.search_tree.root = n || new DecisionNode()

    }
    selectAction(e) {
		this.search_tree.root = new DecisionNode(null,this.search_tree)
        return this.search_tree.bestAction()
    }
}

class SquareKSA extends BayesAgent {
    utility(percept) {
		return -1 * Math.pow(this.model.xi(percept),2)
    }
}

class ShannonKSA extends BayesAgent {
    utility(percept) {
		return -1*Util.entropy(this.model.weights)
    }
}

class KullbackLeiblerKSA extends BayesAgent {
    utility(percept) {
		//TODO
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
		let idx = Util.sample(this.model.weights)
		this.rho = this.model.model_class[idx].copy()
		this.search_tree = new ExpectimaxTree(this,this.rho)
	}
	update(a,e) {
		super.update(a,e)
		this.rho.perform(a)
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
