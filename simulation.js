var map1 = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","W","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","W","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

//Not sure if these should be global
var history;
var res;
var context;
var time;
class timeSlice {
  constructor(q, obs, reward, envt) {
    this.q = q; // Make abstract for other agents
    this.obs = obs;
    this.reward = reward
    this.xpos = envt.pos.x
    this.ypos = envt.pos.y
  }
}

var map2 = [["F","F","F","F","F"],
            ["W","W","F","W","F"],
            ["W","F","F","F","W"],
            ["F","F","F","W","W"],
            ["W","W","C","W","W"]]

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
        time = new timeSlice(q, s_, r, env)
        history[iter] = time
        //TODO start to show history and visualise
        //(User defined parameters, so will select which timeSlice to view,
        //or can progress at a set speed (maybe add graphs etc later) )
        //Update for next cycle
        s = s_
        r_ave = (r + iter * r_ave)/(iter + 1)
        iter++
    }
    history[0] = env //first element will be used to figure out context for vis.
    return history
}
function viewTime(){
      //Retrieve user defined timeslice
    time = document.getElementById("selectTime").value

    //log the timeslice info
      console.log("History: Agent is in position (" + res[time].ypos+ ","+
    res[time].xpos+") with an updated Q value of "+ res[time].q);

    draw(context, res[0], res[time].xpos, res[time].ypos)

}

function viewTime(){
      //Retrieve user defined timeslice
    time = document.getElementById("selectTime").value

    //log the timeslice info
      console.log("History: Agent is in position (" + res[time].ypos+ ","+
    res[time].xpos+") with an  updated Q value of "+ res[time].q);

    draw(context, res[0], res[time].xpos, res[time].ypos)

}


function increment(){
      time++;
      console.log("History: Agent is in position (" + res[time].ypos+ ","+
    res[time].xpos+") with an  updated Q value of "+ res[time].q);
    draw(context, res[0], res[time].xpos, res[time].ypos)

}

function start() {
    // experiment parameters
    var alpha = 0.9; var gamma = 0.99; var epsilon = 0.01;var t_max = 1e6

    env = new SimpleEpisodicGrid(map1)

    context = visualize(env)


    agent = new QLearn(env,alpha,gamma,epsilon)
    res = simulate(env,agent,t_max)
    env.optimal_average_reward = 10 / 26 // for map1 (!)
    console.log("Optimal average reward: " + env.optimal_average_reward)
    //console.log("Total reward: " + Math.floor(res[0] * res[1]))
// todo VISUALISE history / show statistics/etc
  //  ctx = visualize(env)
    //draw(ctx,env)
}
