function start() {
    var alpha = doc_get("alpha")
    var gamma = doc_get("gamma")
    var epsilon = doc_get("epsilon")
    var t_max = doc_get("t_max")

    env = new SimpleEpisodicGrid(episodic1)
    agent = new QLearn(alpha,gamma,epsilon,env.actions.length)
    history = simulate(env,agent,t_max)
    vis = new Visualisation(env,history)
}
