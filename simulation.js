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

        slice = {
            //q : agent.Q.get(s_, a), // TODO only works for tabular agents
            obs : s_,
            reward : r_total+=r,
            pos : env.pos
        }
        history.push(slice)
    }
    return history
}
