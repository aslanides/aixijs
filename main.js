function start() {
    env = new SimpleDispenserGrid(dispenser1)
    options = new Options(env)
    options.set_model_class(dispenser1)
    options.set_prior("Mu",env.grid.disp[0][0],env.grid.disp[0][1])
    agent = new BayesAgent(options)
    history = simulate(env,agent,options.t_max)
    vis = new Visualisation(env,history)
}
