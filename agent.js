class Agent {
    constructor(env,alpha,gamma,epsilon) {
        this.epsilon = epsilon
        this.gamma = gamma
        this.alpha = alpha
        this.num_actions = env.actions.length
    }
    select_action(obs) {
        return Math.floor(Math.random() * this.num_actions)
    }
    update(obs,a,rew,obs_) {
        throw "Not implemented!"
    }
}

class TabularAgent extends Agent {
    constructor(env,alpha,gamma,epsilon) {
        super(env,alpha,gamma,epsilon)
        this.Q = new QTable(env.num_states,this.num_actions)
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
}

class QLearn extends TabularAgent {
    update(obs,a,rew,obs_) {
        var Q_old = this.Q.get(obs,a)
        var Q_new = Q_old +
            this.alpha*(
                rew + this.gamma*this.Q.get(obs_,this.argmax(obs_)) - Q_old
            )
        this.Q.set(obs,a,Q_new)
    }
}

class SARSA extends TabularAgent {
    update(obs,a,rew,obs_) {
        var Q_old = this.Q.get(obs,a)
        var Q_new = Q_old +
            this.alpha*(
                rew + this.gamma*this.Q.get(obs_,this.select_action(obs_)) - Q_old
            )
        this.Q.set(obs,a,Q_new)
    }
}
