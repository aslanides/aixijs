function simulate(env,agent,t) {
    history = []
    r_total = 0
    s = env.initial_state
    for (var iter = 0; iter < t; iter++) {
        a = agent.select_action(s)
        percept = env.perform(a)
        s_ = percept.obs
        r = percept.rew
        agent.update(s,a,r,s_)
        s = s_

        time = {
            q:agent.Q.get(s_, a), // TODO only works for tabular agents
            obs:s_,
            reward:r_total+=r,
            pos:env.pos
        }

        history.push(time)
    }
    return history
}

function start() {
    var alpha = doc_get("alpha")
    var gamma = doc_get("gamma")
    var epsilon = doc_get("epsilon")
    var t_max = doc_get("t_max")

    env = new SimpleEpisodicGrid(episodic1)
    agent = new QLearn(alpha,gamma,epsilon,env.actions.length)
    history = simulate(env,agent,t_max)

    vis = new Visualisation(env,history)
    vis.viewTime()
}
