var QLearn = function(env,alpha,gamma,epsilon) {
    this.epsilon = epsilon
    this.gamma = gamma
    this.alpha = alpha
    this.num_actions = env.actions.length
    this.Q = zeros(env.M*env.N * this.num_actions)
}

QLearn.prototype = {
    argmaxQ : function(obs) {
        var Q_max = Number.NEGATIVE_INFINITY
        for (i = 0; i < this.num_actions; i++) {
            Q = this.Q[this.get_idx(obs,i)]
            if (Q > Q_max) {
                Q_max = Q
                a_max = i
            }
        }
        return a_max
    },
    select_action : function(obs) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        } else {
            return this.argmaxQ(obs)
        }
    },
    update_Q : function(obs,a,rew,obs_) {
        idx = this.get_idx(obs,a)

        //console.log(obs_)
        Q_tmp = this.Q[idx]
        this.Q[idx] = Q_tmp + this.alpha*(rew+this.gamma*this.Q[this.get_idx(obs_,this.argmaxQ(obs_))] - Q_tmp)
    },
    get_idx : function(o,a) {
        return o*this.num_actions+a
    }
}
