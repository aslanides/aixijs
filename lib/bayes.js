class BayesMixture {
    constructor(options) {
        this.model_class = Util.arrayCopy(options.model_class)
        this.C = this.model_class.length
        this.saved_weights

        this.weights = Util.zeros(this.C)
        if (options.prior_type == 'Uniform') {
            for (let i = 0; i < this.C; i++) {
                this.weights[i] = 1/(this.C)
            }
        } else if (options.prior_type == 'Ockham') {
            throw 'TODO'
        } else if (options.prior_type == 'Dogmatic') {
            throw 'TODO'
        } else if (options.prior_type == 'Informed') {
            Util.assert(options.mu != undefined,'Model index not specified!')
            this.weights[options.mu] = 1
        } else {
            throw `Unknown prior type: ${prior_type}.`
        }
        Util.assert(Math.abs(Util.sum(this.weights) - 1) < 1e-4,'Prior is not normalised!')
    }

    xi(percept) {
        let s = 0
        for (let i = 0; i < this.C; i++) {
            if (this.weights[i] == 0) {
                continue
            }
            s += this.weights[i] * this.model_class[i].conditionalDistribution(percept)
        }
        Util.assert(s != 0,`The agent's Bayesian mixture assigns 0 probability to the percept (${percept.obs},${percept.rew})`)
        return s
    }

    update(a,e) {
        this.perform(a)
		let xi_tmp = this.xi(e)
        for (let i = 0; i < this.C; i++) {
            this.weights[i] = this.weights[i] * this.model_class[i].conditionalDistribution(e) / xi_tmp
        }
    }

    perform(a) {
		for (let i =0; i < this.C; i++) {
			this.model_class[i].perform(a)
		}
    }

    generatePercept() {
        let idx = Util.sample(this.weights)
        return this.model_class[idx].generatePercept()
    }

    save() {
        this.saved_weights = [...this.weights]
		this.model_class.forEach(m => m.save())
    }

    load() {
        this.weights = this.saved_weights
		for (let i = 0; i < this.C; i++) {
			this.model_class[i].load()
		}
    }

    get(nu) {
        return this.model_class[nu]
    }
}
