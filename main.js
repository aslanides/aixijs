function start() {
    env = new SimpleEpisodicGrid(episodic1)
    options = new Options(env)
    agent = new QLearn(options)
    history = simulate(env,agent,options.t_max)
    vis = new Visualisation(env,history)
}
