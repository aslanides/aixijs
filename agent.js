class Agent {
    constructor(alpha,gamma,epsilon,num_actions) {
        this.epsilon = epsilon
        this.gamma = gamma
        this.alpha = alpha
        this.num_actions = num_actions
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
    constructor(alpha,gamma,epsilon,num_actions) {
        super(alpha,gamma,epsilon,num_actions)
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
    constructor(alpha,gamma,epsilon,num_actions) {
        super(alpha,gamma,epsilon,num_actions)
        this.td_updater = this.argmax
    }
}

class SARSA extends TabularAgent {
    constructor(alpha,gamma,epsilon,num_actions) {
        super(alpha,gamma,epsilon,num_actions)
        this.td_updater = this.select_action
    }
}

class BayesAgent extends Agent {
    constructor(gamma,config) {
        super(0,gamma,0,num_actions)
        var model_class = []
        for (var i = 0; i < config.map[0].length; i++) {
            for (var j = 0; j < config.map.length; j++) {
                model = new SimpleDispenserGrid(config)
                model.add_dispenser(i,j,0.5)
                model_class.push(env)
            }
        }
        var prior = new Array(this.C)
        for (var i = 0; i < this.C; i++) {
            prior[i] = 1/(this.C) // uniform
        }
        this.model = new BayesMixture(model_class,prior)
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
        iter = 0
        this.model.save_checkpoint()
        while (iter < this.timeout) {
            this.search_tree.sample(this,0)
            this.model.load_checkpoint()
            iter++
        }
        return this.search_tree.best_action(this)
    }
}
