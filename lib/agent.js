class Agent {
    constructor(options) {
        this.epsilon = options.epsilon
        this.gamma = options.gamma
        this.alpha = options.alpha
        this.num_actions = options.num_actions
    }
    selectAction(obs) {
        throw "Not implemented!"
    }
    update(obs,a,rew,obs_) {
        throw "Not implemented!"
    }
    utility(percept,dfr) {
        return percept.rew // default for RL agents
    }
}

class RandomAgent extends Agent {
    selectAction(obs) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(obs,a,rew,obs_) {}
}

class TabularAgent extends Agent {
    constructor(options) {
        super(options)
        this.Q = new MyMap()
        this.td_updater = function() {throw "Not implemented"}
    }
    selectAction(obs) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        } else {
            return this.argmax(obs)
        }
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
    update(obs,a,rew,obs_) {
        var Q_old = this.Q.get(obs,a)
        var Q_new = Q_old +
            this.alpha*(
                rew + this.gamma*this.Q.get(obs_,this.td_updater(obs_)) - Q_old
            )
        this.Q.set(obs,a,Q_new)
    }
}

class QLearn extends TabularAgent {
    constructor(options) {
        super(options)
        this.td_updater = this.argmax
    }
}

class SARSA extends TabularAgent {
    constructor(options) {
        super(options)
        this.td_updater = this.selectAction
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
        this.search_timeout = options.search_timeout
        this.search_tree = new ExpectimaxTree()
        this.Q = new MyMap()
    }
    update(obs,a,rew,obs_) {
        this.model.update(a,{obs:obs_,rew:rew})
    }
    selectAction(obs) {
        this.model.save()
        this.search_tree = new ExpectimaxTree()
        for (var iter = 0; iter < this.search_timeout; iter++) {
            this.search_tree.sample(this)
            this.model.load()
        }
        return this.search_tree.bestAction(this)
    }
}

class OptimisticAIXI extends BayesAgent {

}

class BayesExpAgent extends BayesAgent {

}

class SquareKSA extends BayesAgent {
    constructor(options) {
        super(options)
    }
    utility(percept,dfr) {
        if (dfr == this.horizon) {
            -1 * this.model.xi(percept)
        } else {
            return 0
        }
    }
}

class ShannonKSA extends BayesAgent {
    constructor(options) {
        super(options)
    }
    utility(percept,dfr) {
        return -1 * Math.log2(this.model.xi(percept))
    }
}

class KullbackLeiblerKSA extends BayesAgent {
    constructor(options) {
        super(options)
    }
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
    }
    selectAction(obs) {
        if (this.T > this.horizon) {
            this.T = 0
            var idx = Util.sample(this.model.weights)
            var rho = this.model.model_class[idx].copy()
            // TODO finish this off
        }
    }
}
