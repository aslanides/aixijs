function simulate(env,agent,t) {
    s = env.initial_state
    iter = 1;
	r_ave = 0
    while (iter <= t) {
        a = agent.select_action(s)
        percept = env.perform(a)
        s_ = percept.obs
        r = percept.rew
        agent.update(s,a,r,s_)
        q = agent.Q.get(s_, a)
        r_ave = (r + iter * r_ave)/(iter + 1)
        time = new TimeSlice(q, s_, r, env, r_ave)
        history[iter] = time
        s = s_
        iter++
    }
    history[0] = env //first element will be used to figure out context for vis.
    return history
}

function start() {
    var alpha = document.getElementById("alpha").value;
    var gamma = document.getElementById("gamma").value;
    var epsilon = document.getElementById("epsilon").value;
    var t_max = document.getElementById("t_max").value;

    time = 0;
    env = new SimpleEpisodicGrid(episodic1)
    context = visualize(env)
    agent = new QLearn(alpha,gamma,epsilon,env.actions.length)
    res = simulate(env,agent,t_max)
    env.optimal_average_reward = 10 / 26 // for map1 (!)
    console.log("Optimal average reward: " + env.optimal_average_reward)
    viewTime();

}
