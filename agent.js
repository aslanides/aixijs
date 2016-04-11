class Agent {
    constructor(alpha,gamma,epsilon,num_actions) {
        this.epsilon = epsilon
        this.gamma = gamma
        this.alpha = alpha
        this.num_actions = num_actions
    }
    select_action(obs) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(obs,a,rew,obs_) {
        throw "Not implemented!"
    }
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
        this.env_class = []
        for (var i = 0; i < env.grid.M; i++) {
            for (var j = 0; j < env.grid.N; j++) {

            }
        }
        this.weights = []
        //this.xi = TODO

    }
}
