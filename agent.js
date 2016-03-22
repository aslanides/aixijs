var QLearn = function(env,alpha,gamma,epsilon) {
    this.epsilon = epsilon
    this.gamma = gamma
    this.alpha = alpha
    this.num_actions = env.actions.length
    this.Q = zeros(env.M * env.N * this.num_actions)
}

QLearn.prototype = {
    select_action : function(obs) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.num_actions)
        } else {
            return argmax(this.Q,obs,this.num_actions)
        }
    },
    update_Q : function(obs,a,rew,obs_) {
        idx = get_idx(obs,a,this.num_actions)
        Q_tmp = this.Q[idx]
        this.Q[idx] = Q_tmp + this.alpha*(rew+this.gamma*this.Q[get_idx(obs_,argmax(this.Q,obs_,this.num_actions),this.num_actions)] - Q_tmp)
    },
}

var AIXI = function(env,horizon) {

}

AIXI.prototype = {}
