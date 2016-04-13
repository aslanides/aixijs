class Options {
    constructor(doc,env) {
        this.alpha = doc.getElementById("alpha").value
        this.gamma = doc.getElementById("gamma").value,
        this.epsilon = doc.getElementById("epsilon").value,
        this.t_max = doc.getElementById("t_max").value

        doc.getElementById("slider").max = this.t_max
        
        this.num_actions = env.actions.length
        this.model_class = []
        this.M = env.grid.M
        this.N = env.grid.N
        this.freqs = env.grid.freqs

        this.prior_type
        this.midx
    }
    // TODO methods here?
}
