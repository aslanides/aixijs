class Options {
    constructor(env) {
        this.alpha = doc_get("alpha"),
        this.gamma = doc_get("gamma"),
        this.epsilon = doc_get("epsilon"),
        this.t_max = doc_get("t_max")
        this.num_actions = env.actions.length
        this.model_class = []
    }
    set_model_class() {
        // TODO generalise
        var N = 5
        for (var i = 0; i < N; i++) {
            for (var j = 0; j < N; j++) {
                var model = new SimpleDispenserGrid(blank5x5)
                model.grid.add_dispenser(i,j,0.5)
                this.model_class.push(model)
            }
        }
    }
    set_prior(type) {
        assert(C > 0, "Model class not set!")
        var C = this.model_class.length
        this.prior = new Array(C)
        if (type == "uniform") {
            for (var i = 0; i < C; i++) {
                this.prior[i] = 1/(C)
            }
        } else {
            throw "Unknown prior type"
        }
    }
}
