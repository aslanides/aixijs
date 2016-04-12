function simulate(env,agent,t) {
    var history = []
    var r_total = env.initial_percept.rew
    var s = env.initial_percept.obs
    for (var iter = 0; iter < t; iter++) {
        var slice = {
            obs : s,
            reward : r_total,
            pos : env.pos
        }
        var a = agent.select_action(s)
        var percept = env.perform(a)
        var s_ = percept.obs
        var r = percept.rew
        agent.update(s,a,r,s_)
        s = s_

        r_total += r
        history.push(slice)
    }
    return history
}
