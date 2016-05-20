class Agent {
    constructor(options) {
        this.epsilon = options.epsilon
        this.gamma = options.gamma
        this.alpha = options.alpha
        this.num_actions = options.num_actions
		this.lifetime = 0
    }
    selectAction(obs) {
        throw "Not implemented!"
    }
    update(a,o,r) {
        throw "Not implemented!"
    }
    utility(percept) {
        return percept.rew // default for RL agents
    }
	getModel() {
		throw "Not implemented"
	}
}

class RandomAgent extends Agent {
    selectAction(obs) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(a,o,r) {}
}

class TabularAgent extends Agent {
    constructor(options) {
        super(options)
        this.Q = new QTable()
		this.tracer = TabularTrace
		this.vis = TabularVis
		this.last_q = 0
		this.last_o = options.initial_obs
    }
    selectAction(obs) {
		this.lifetime++
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        }
		return this.argmax(obs)
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
    update(a,o,r) {
        var Q_old = this.Q.get(this.last_o,a)
        var Q_new = Q_old +
            this.alpha*(
                r + this.gamma*this.Q.get(o,this.TDUpdate(o)) - Q_old
            )
        this.Q.set(this.last_o,a,Q_new)
		this.last_q = Q_new
		this.last_o = o
    }
	TDUpdate(obs) {
		throw "not implemented"
	}
}

class QLearn extends TabularAgent {
	TDUpdate(obs) {
		return this.argmax(obs)
	}
}

class SARSA extends TabularAgent {
	TDUpdate(obs) {
		return this.selectAction(obs)
	}
}

class BayesAgent extends Agent {
    constructor(options) {
        super(options)
        this.model = new BayesMixture(options)
        this.horizon = options.horizon
        this.UCBweight = options.UCBweight
        this.max_reward = r_chocolate
        this.min_reward = r_wall
        this.samples = options.samples
        this.search_tree = new ExpectimaxTree(this,this.model)
        this.tracer = BayesTrace
		this.vis = BayesVis
		this.information_gain = 0
    }
    update(a,o,r) {
		this.model.save()
        this.model.update(a,{obs:o,rew:r})
		this.information_gain = Util.KLDivergence(this.model.weights,
			this.model.saved_weights)
		this.search_tree.root = this.search_tree.root
			.getChild(a)
			.getChild({obs:o,rew:r})
    }
    selectAction(obs) {
        return this.search_tree.bestAction()
    }
}

class OptimisticAIXI extends BayesAgent {

}

class BayesExp extends BayesAgent {

}

class SquareKSA extends BayesAgent {
    utility(percept,dfr) {
        if (dfr == this.horizon) {
            -1 * this.model.xi(percept)
        } else {
            return 0
        }
    }
}

class ShannonKSA extends BayesAgent {
    utility(percept,dfr) {
        return -1 * Math.log2(this.model.xi(percept))
    }
}

class KullbackLeiblerKSA extends BayesAgent {
    utility(percept,dfr) {
        // TODO
    }
}

class TorAgent extends Agent {

}

class MDLAgent extends Agent {

}

class ThompsonAgent extends BayesAgent {
    constructor(options) {
        super(options)
        this.T = 0
        this.rho
    }
    selectAction(obs) {
        if (this.T % this.horizon == 0) {
            var idx = Util.sample(this.model.weights)
            this.rho = this.model.model_class[idx].copy()
            this.search_tree = new ExpectimaxTree(this,this.rho)
        }
        this.T++
        return this.search_tree.bestAction()
    }
}
