class BayesMixture {
    constructor(model_class,prior) {
        this.model_class = model_class
        this.C = model_class.length
        this.weights = prior
        this.saved_weights
    }

    xi(obs,rew) {
        sum = 0
        for (var i = 0; i < this.C; i++) {
            sum += this.weights[i] * this.model_class[i].nu(obs,rew)
        }
        return sum
    }

    update(a,obs,rew) {
        var xi_tmp = this.xi(obs,rew)
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].perform(a)
            this.weights[i] = this.weights[i] * this.model_class[i].nu(obs,rew) / xi_tmp
        }
    }

    sample(a) {
        // TODO check that this is correct
        p = 0
        s = Math.random()
        var percept
        for (var i = 0; i < this.C. i++) {
            p += this.weights[i]
            pp = this.model_class[i].perform(a)
            if (s <= p) {
                percept = pp
            }
        }
        return percept
    }
    save_checkpoint() {
        this.saved_weights = Array.from(this.weights)
    }
    load_checkpoint() {
        this.weights = Array.from(this.saved_weights)
    }
}
