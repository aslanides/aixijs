class BayesMixture {
    constructor(model_class,prior_type,midx) {
        this.model_class = model_class
        this.C = model_class.length
        this.saved_weights

        var C = this.model_class.length
        this.weights = Util.zeros(C)
        if (prior_type == "Uniform") {
            for (var i = 0; i < C; i++) {
                this.weights[i] = 1/(C)
            }
        } else if (prior_type == "Ockham") {
            throw "TODO"
        } else if (prior_type == "Dogmatic") {
            throw "TODO"
        } else if (prior_type == "Mu") {
            Util.assert(midx != undefined,"Model index not specified!")
            this.weights[midx] = 1
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
        var p = 0
        var s = Math.random()
        var percept
        for (var i = 0; i < this.C; i++) {
            p += this.weights[i]
            this.model_class[i].do(a)
            var pp = this.model_class[i].generatePercept()
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
