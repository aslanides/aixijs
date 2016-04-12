class Agent {
    constructor(options) {
        this.epsilon = options.epsilon
        this.gamma = options.gamma
        this.alpha = options.alpha
        this.num_actions = options.num_actions
    }
    select_action(obs) {
        throw "Not implemented!"
    }
    update(obs,a,rew,obs_) {
        throw "Not implemented!"
    }
}

class RandomAgent {
    select_action(obs) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(obs,a,rew,obs_) {}
}

class TabularAgent extends Agent {
    constructor(options) {
        super(options)
        this.Q = new QTable()
        this.td_updater
    }
    select_action(obs) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        } else {
            return this.argmax(obs)
        }
    }
    argmax(obs) {
        //arg max Q over actions given obs. break ties uniformly at random
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
        return random_choice(ties)
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
        this.td_updater = this.select_action
    }
}

class BayesAgent extends Agent {
    constructor(options) {
        super(options)
        this.model = new BayesMixture(options.model_class,options.prior)
        this.horizon = 5
        this.UCBweight = 1
        this.max_reward = r_chocolate
        this.min_reward = r_wall
        this.timeout = 100 // iterations of search
        this.search_tree = new DecisionNode()
    }
    update(obs,a,rew,obs_) {
        this.model.update(obs,a,rew)
    }
    select_action(obs) {
        var iter = 0
        this.model.save_checkpoint()
        while (iter < this.timeout) {
            this.search_tree.sample(this,0)
            this.model.load_checkpoint()
            iter++
        }
        return this.search_tree.best_action(this)
    }
}
