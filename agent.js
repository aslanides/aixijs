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
        console.log("Beep Beep Boop")
    }
}

class TabularAgent extends Agent {
    constructor(env,alpha,gamma,epsilon) {
        super(env,alpha,gamma,epsilon)
        this.Q = zeros(env.num_states * this.num_actions)
    }
    select_action(obs) {
        // epsilon-greedy
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        } else {
            return this.argmax(obs)
        }
    }
    get_idx(obs,a) {
        return obs*this.num_actions + a
    }
    argmax(obs) {
        //arg max Q over actions given obs. break ties uniformly at random
        var Q_max = Number.NEGATIVE_INFINITY
        var ties = []
        var Qtmp
        for (var a = 0; a < this.num_actions; a++) {
            Qtmp = this.Q[this.get_idx(obs,a)]
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
        var idx = this.get_idx(obs,a)
        var Q_tmp = this.Q[idx]
        this.Q[idx] = Q_tmp +
            this.alpha*(
                rew + this.gamma*this.Q[this.get_idx(obs_,this.argmax(obs_))]
                 - Q_tmp
            )
    }
}

class SARSA extends TabularAgent {
    update(obs,a,rew,obs_) {
        var idx = this.get_idx(obs,a)
        var Q_tmp = this.Q[idx]
        this.Q[idx] = Q_tmp +
            this.alpha*(
                rew + this.gamma*this.Q[this.get_idx(obs_,this.select_action(obs_))] - Q_tmp
            )
    }
}
