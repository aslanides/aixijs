class BayesMixture {
    constructor(options) {
        this.model_class = options.model_class
        this.C = this.model_class.length
        this.saved_weights

        this.weights = Util.zeros(this.C)
        if (options.prior_type == "Uniform") {
            for (var i = 0; i < this.C; i++) {
                this.weights[i] = 1/(this.C)
            }
        } else if (options.prior_type == "Ockham") {
            throw "TODO"
        } else if (options.prior_type == "Dogmatic") {
            throw "TODO"
        } else if (options.prior_type == "Informed") {
            Util.assert(options.midx != undefined,"Model index not specified!")
            this.weights[options.midx] = 1
        } else {
            throw `Unknown prior type: ${prior_type}.`
        }
        Util.assert(Math.abs(Util.sum(this.weights) - 1) < 1e-4,"Prior is not normalised!")
    }

    xi(percept) {
        var s = 0
        for (var i = 0; i < this.C; i++) {
            if (this.weights[i] == 0) {
                continue
            }
            s += this.weights[i] * this.model_class[i].conditionalDistribution(percept)
        }
        Util.assert(s != 0,`The agent's Bayesian mixture assigns 0 probability to the percept (${percept.obs},${percept.rew})`)
        return s
    }

    update(a,percept) {
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].do(a)
        }
        var xi_tmp = this.xi(percept)
        for (var i = 0; i < this.C; i++) {
            this.weights[i] = this.weights[i] * this.model_class[i].conditionalDistribution(percept) / xi_tmp
        }
    }

    sample(a) {
        for (var i = 0; i < this.C; i++) {
            this.model_class[i].do(a)
        }
        var idx = Util.sample(this.weights)
        var percept = this.model_class[idx].generatePercept()

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
