class Options {
    constructor() {
        this.UCBweight = 1
        this.horizon = 6
        this.search_timeout = 400

        this.alpha = 0.9
        this.gamma = 0.99
        this.epsilon = 0.01
        this.t_max = 1e3

        this.model_class = []
        this.prior_type = "Uniform"
        this.mu
    }

    getParams(doc,env) {
        this.M = env.grid.M
        this.N = env.grid.N
        this.freqs = env.grid.freqs
        this.num_actions = env.actions.length

        this.alpha = doc.getElementById("alpha").value
        this.gamma = doc.getElementById("gamma").value,
        this.epsilon = doc.getElementById("epsilon").value,
        this.t_max = doc.getElementById("t_max").value
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
