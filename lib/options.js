class Options {
    constructor() {
        this.UCBweight = 1
        this.horizon = 6
        this.search_timeout = 400

        this.alpha = 0.9
        this.gamma = 0.99
        this.epsilon = 0.01
        this.t_max = 100

        this.model_class = []
        this.prior_type = "Uniform"
        this.mu
    }

    getAgentParams(doc) {
        this.alpha = parseFloat(doc.getElementById("alpha").value)
        this.gamma = parseFloat(doc.getElementById("gamma").value)
        this.epsilon = parseFloat(doc.getElementById("epsilon").value)
        this.t_max = parseFloat(doc.getElementById("cycles").value)

		var validParam = function(param) {
			return !(isNaN(param) || !param || param < 0 || param > 1)
		}

		return 	validParam(this.alpha) &&
				validParam(this.gamma) &&
				validParam(this.epsilon) &&
				this.t_max > 0
    }

	getEnvParams(env) {
		this.M = env.grid.M
		this.N = env.grid.N
		this.freqs = env.grid.freqs
		this.num_actions = env.actions.length
	}

	static setParams(doc,opt) {
		for (var k of ["p_alpha","p_gamma","p_epsilon"]) {
			document.getElementById(k).style.display = "none"
		}
		for (var key in opt) {
			document.getElementById(key).value = opt[key]
			document.getElementById("p_" + key).style.display = "table-row"
		}
	}

    static makeModels(env_class,conf,field) {
        var model_class = []
        var cfg = Util.deepCopy(conf)
        for (var i = 0; i < cfg.map.length; i++) {
            for (var j = 0; j < cfg.map[0].length; j++) {
                cfg[field] = {x:i,y:j}
                var model = new env_class(cfg)
                model_class.push(model)
            }
        }
        return model_class
    }
}
