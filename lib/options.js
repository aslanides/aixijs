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
		for (var key of ["alpha","gamma","epsilon","horizon","samples","cycles"]) {
			if (doc.getElementById("p_" + key).style.display != "table-row") {
				continue
			}
			var val = parseFloat(doc.getElementById(key).value)
			this[key] = val

			if (key == "cycles" || key == "horizon" || key == "samples") {
				if (!validLatin(val)) {
					return false
				}
			} else if (!validGreek(val)) {
				return false
			}
		}
		return true
    }

	getEnvParams(env) {
		this.M = env.grid.M
		this.N = env.grid.N
		this.freqs = env.grid.freqs
		this.num_actions = env.actions.length
		this.initial_obs = env.initial_percept.obs
	}

	static setParams(doc,opt) {
		for (var k of ["alpha","gamma","epsilon","horizon","samples","cycles"]) {
			document.getElementById("p_" + k).style.display = (k in opt ? "table-row" : "none")
			var el = document.getElementById(k)
			el.required = (k in opt)
			el.value = opt[k] || 0
		}
	}

    makeModels(env_class,conf,field) {
        var cfg = Util.deepCopy(conf)
        for (var i = 0; i < cfg.map.length; i++) {
            for (var j = 0; j < cfg.map[0].length; j++) {
                cfg[field] = {x:i,y:j}
                var model = new env_class(cfg)
                this.model_class.push(model)
            }
        }
    }
}
