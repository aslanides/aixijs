class BayesMixture {
    constructor(model_class,prior) {
        this.model_class = model_class
        this.C = model_class.length
        this.weights = prior
        this.saved_weights
    }

    xi(obs,rew) {
        var s = 0
        for (var i = 0; i < this.C; i++) {
            if (this.weights[i] == 0) {
                continue
            }
            s += this.weights[i] * this.model_class[i].nu(obs,rew)
        }
        if (s == 0) {
            throw new Error(`The agent's Bayesian mixture assigns 0 probability to the percept (${obs},${rew})`)
        }
        return s
    }

    update(a,obs,rew) {
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].perform(a)
        }
        var xi_tmp = this.xi(obs,rew)
        for (var i = 0; i < this.C; i++) {
            this.weights[i] = this.weights[i] * this.model_class[i].nu(obs,rew) / xi_tmp
        }
    }

    sample(a) {
        // TODO check that this is correct
        var p = 0
        var s = Math.random()
        var percept
        for (var i = 0; i < this.C; i++) {
            p += this.weights[i]
            var pp = this.model_class[i].perform(a)
            if (s <= p) {
                percept = pp
            }
        }
        return percept
    }
    save() {
        this.saved_weights = Array.from(this.weights)
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].save()
        }
    }
    load() {
        this.weights = Array.from(this.saved_weights)
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].load()
        }
    }
}
