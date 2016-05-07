class Options {
    constructor(doc,env) {
        this.alpha = doc.getElementById("alpha").value
        this.gamma = doc.getElementById("gamma").value,
        this.epsilon = doc.getElementById("epsilon").value,
        this.t_max = doc.getElementById("t_max").value

        doc.getElementById("slider").max = this.t_max
		doc.getElementById("slider").step = this.t_max / 50

        this.num_actions = env.actions.length
        this.model_class = []
        this.M = env.grid.M
        this.N = env.grid.N
        this.freqs = env.grid.freqs

        this.prior_type
        this.midx
    }

    static makeModels(env_class,conf) {
        var model_class = []
        var cfg = Util.deepCopy(conf)
        for (var i = 0; i < cfg.map.length; i++) {
            for (var j = 0; j < cfg.map[0].length; j++) {
                cfg.dispenser_pos = {x:i,y:j}
                var model = new env_class(cfg)
                model_class.push(model)
            }
        }
        return model_class
    }
}
