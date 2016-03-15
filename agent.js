function QLearn(env,alpha,gamma,epsilon) {
    this.epsilon = epsilon
    this.gamma = gamma
    this.alpha = alpha
    this.actions = params.environment.allowed_actions
    this.Q = new Map();
    for (i = 0; i < params.environment.M; i++) {
        for (j = 0; j < params.environment.N; j++) {
            for (a of this.actions) {
                wtf = [i,j,a].join()
                this.Q.set(wtf,0.0)
            }
        }
    }
    this.argmaxQ = function(s) {
        var Q_max = Number.NEGATIVE_INFINITY
        var a_max;
        var Q;
        for (a in this.actions) {
            Q = this.Q.get([s[0],s[1],a].join())
            if (Q > Q_max) {
                Q_max = Q
                a_max = a;
            }
        }
        return a_max
    }
    this.select_action = function(s) {
        if (Math.random() < this.epsilon) {
            return this.actions[Math.floor(Math.random() * this.actions.length)]
        } else {
            return this.argmaxQ(s)
        }

    }
    this.update_Q = function(s,a,r,s_) {
        sa = [s[0],s[1],a].join()
        Q_tmp = this.Q.get(sa)
        this.Q.set(sa,Q_tmp + this.alpha*(r+this.gamma*this.Q.get([s_[0],s_[1],this.argmaxQ(s_)].join()) - Q_tmp))
    }
}
