function simulate(env,agent,t) {
    s = env.initial_state
    r_tot = 0
    iter = 1;
    while (iter <= t) {
        a = agent.select_action(s)
        percept = env.perform(a)
        s_ = percept.obs
        r = percept.rew
        agent.update(s,a,r,s_)
        s = s_
        r_tot += r
        iter++
    }
    return [r_tot/iter, iter]
}

function start() {
    env = new SimpleDispenserGrid(dispenser1)
    agent = new QLearn(env,alpha=0.9,gamma=0.99,epsilon=0.01)
    res = simulate(env,agent,t=1e6)

    // log output
    console.log("Agent: "+ agent.constructor.name)
    console.log("Agent's average reward: " + res[0])
    console.log("Optimal average reward: " + env.optimal_average_reward)
    console.log("Total reward: " + Math.floor(res[0] * res[1]))
    if (env.constructor.name == "DispenserGrid") {
        nd = 0
        for (var val of env.disp) {
            nd += env.tiles[val[0]][val[1]].num_dispensed
        }
        console.log("Chocolates dispensed: " +  nd)
    }

    ctx = visualize(env)
    draw(ctx,env)
}
