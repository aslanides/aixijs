function start() {

    //env = new SimpleDispenserGrid(dispenser1)
    env = new SimpleEpisodicGrid(episodic1)

    options = new Options(document,env)
    options.prior_type = "Mu"
    //options.midx = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]

    for (var i = 0; i < this.M; i++) {
        for (var j = 0; j < this.N; j++) {
            dispenser1.dispenser_pos = {x:i,y:j}
            var model = new SimpleDispenserGrid(cfg)
            options.model_class.push(model)
        }
    }

    //agent = new BayesAgent(options)
    agent = new QLearn(options)

    hist = simulate(env,agent,options.t_max)
    vis = new Visualisation(env,hist)
}
