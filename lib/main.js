function start() {

    //env = new SimpleDispenserGrid(dispenser1)
    env = new SimpleEpisodicGrid(episodic1)

    options = new Options(document,env)
    options.prior_type = "Mu"
    //options.midx = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
    options.model_class = make_M(dispenser1)


    //agent = new BayesAgent(options)
    agent = new QLearn(options)

    hist = simulate(env,agent,options.t_max)
    vis = new Visualisation(env,hist)
}

function make_M(env_class,conf) {
    var model_class = []
    var cfg = Util.deepcopy(conf)
    for (var i = 0; i < cfg.map.length; i++) {
        for (var j = 0; j < cfg.map[0].length; j++) {
            cfg.dispenser_pos = {x:i,y:j}
            var model = new env_class(cfg)
            model_class.push(model)
        }
    }
    return model_class
}
