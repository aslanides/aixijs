class Options {
    constructor() {
        this.UCBweight = 1
        this.horizon = 6
        this.samples = 400

        this.alpha = 0.9
        this.gamma = 0.99
        this.epsilon = 0.01
        this.cycles = 100

        this.model_class = []
        this.prior_type = "Uniform"
        this.mu
    }

    getAgentParams(doc) {
		var validGreek = function(param) {
			return !(isNaN(param) || param < 0 || param > 1)
		}
		var validLatin = function(param) {
			return (!isNaN(param) || param < 1)
		}
		for (var key of ["alpha","gamma","epsilon","horizon","samples","ucb","cycles"]) {
			if (doc.getElementById("p_" + key).style.display != "table-row") {
				continue
			}
			var val = parseFloat(doc.getElementById(key).value)
			this[key] = val

			if (key == "cycles" ||
				key == "horizon" ||
				key == "samples" ||
				key == "ucb") {
				if (!validLatin(val)) {
					return false
				}
			} else if (!validGreek(val)) {
				return false
			}
		}
		return true
    }

	static setAgentParams(doc,opt) {
		for (var k of ["alpha","gamma","epsilon","horizon","samples","ucb","cycles"]) {
			document.getElementById("p_" + k).style.display = (k in opt ? "table-row" : "none")
			var el = document.getElementById(k)
			el.required = (k in opt)
			el.value = opt[k] || 1
		}
	}

	getEnvParams(env) {
		this.M = env.M
		this.N = env.N
		this.freqs = env.freqs
		this.num_actions = env.actions.length
		this.initial_obs = env.generatePercept().obs
	}

	static toggleExplanation(doc,exp) {
		var divs = doc.getElementsByClassName("md")
		for (var i = 0; i < divs.length; i++) {
			if (divs[i].id == exp + "_exp") {
				divs[i].style.display = "block"
			} else {
				divs[i].style.display = "none"
			}
		}
	}
}
