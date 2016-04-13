class Options {
    constructor(env) {
        this.alpha = doc_get("alpha"),
        this.gamma = doc_get("gamma"),
        this.epsilon = doc_get("epsilon"),
        this.t_max = doc_get("t_max")
        doc_set("slider",this.t_max,true)
        this.num_actions = env.actions.length
        this.model_class = []
        this.M = env.grid.M
        this.N = env.grid.N
        this.freqs = env.grid.freqs
    }
    set_model_class(cfg) {
        for (var i = 0; i < this.M; i++) {
            for (var j = 0; j < this.N; j++) {
                cfg.dispenser_pos = {x:i,y:j}
                var model = new SimpleDispenserGrid(cfg)
                this.model_class.push(model)
            }
        }
    }
    set_prior(type,x,y) {
        var C = this.model_class.length
        assert(C > 0, "Model class not set!")
        this.prior = zeros(C)
        if (type == "Uniform") {
            for (var i = 0; i < C; i++) {
                this.prior[i] = 1/(C)
            }
        } else if (type == "Ockham") {
            throw "TODO"
        } else if (type == "Dogmatic") {
            throw "TODO"
        } else if (type == "Mu") {
            assert(x != undefined && y != undefined, "x and y not set")
            this.prior[this.M * x + y] = 1
        } else {
            throw "Unknown prior type."
        }
        assert(Math.abs(sum(this.prior) - 1) < 1e-4,"Prior is not normalised!")
    }
}
