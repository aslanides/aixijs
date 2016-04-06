var map1 = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","W","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","W","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

//My code
var history;
var res;
class timeSlice {
  constructor(q, obs, reward, xpos, ypos) {
    this.q = q;
    this.obs = obs;
    this.reward = reward
    this.xpos = xpos
    this.ypos = ypos
  }
}

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
        //My code
        q = agent.Q.get(s_, a)
        xpos = env.pos.x
        ypos = env.pos.y
        time = new timeSlice(q, s_, r, xpos, ypos)
        history[iter - 1] = time
        //TODO start to show history and visualise
        //(User defined parameters, so will select which timeSlice to view,
        //or can progress at a set speed (maybe add graphs etc later) )
        //Update for next cycle
        s = s_
        r_ave = (r + iter * r_ave)/(iter + 1)
        iter++
    }
    return history
}
function viewTime(){
      //Retrieve user defined timeslice
    var time = document.getElementById("selectTime").value
    //log the timeslice info
      console.log("History: Agent is in position (" + res[time].ypos+ ","+
    res[time].xpos+") with an updated Q value of "+ res[time].q);

}


function start() {
    // experiment parameters
    var alpha = 0.9; var gamma = 0.99; var epsilon = 0.01;var t_max = 1e6
    env = new EpisodicGrid(map1)
    agent = new QLearn(env,alpha,gamma,epsilon)
    res = simulate(env,agent,t_max)

  //  console.log("Agent's average reward: " + res[0])
    console.log("Optimal average reward: " + env.optimal_average_reward)
    //console.log("Total reward: " + Math.floor(res[0] * res[1]))
// todo VISUALISE history / show statistics/etc
    ctx = visualize(env)
    draw(ctx,env)
}
