var map1 = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","T","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","T","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

function simulate(env,agent,t) {
    s = env.initial_state
    r_ave = 0
    iter = 1;
    while (iter <= t) {
        a = agent.select_action(s)
        percept = env.perform(a)
        s_ = percept.obs
        r = percept.rew
        agent.update(s,a,r,s_)
        s = s_
        r_ave = (r + iter * r_ave)/(iter + 1)
        iter++
    }
    return [r_ave, iter]
}

function start() {
    var alpha = 0.9; var gamma = 0.99; var epsilon = 0.01
    env = new EpisodicGrid(map1)
    agent = new QLearn(env,alpha,gamma,epsilon)
    ctx = visualize(env)
    res = simulate(env,agent,5e5)
    console.log("Agent's average reward: " + res[0])
    console.log("Optimal average reward: " + env.optimal_average_reward)
    console.log("Total reward: " + Math.floor(res[0] * res[1]))
    draw(ctx,env)
}
