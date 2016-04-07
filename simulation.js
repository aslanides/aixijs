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
var interval;
class TimeSlice {
	constructor(q, obs, reward, envt) {
		this.q = q; // Make abstract for other agents
		this.obs = obs;
		this.reward = reward
		this.xpos = envt.pos.x
		this.ypos = envt.pos.y
		this.r_ave = r_ave
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
        r_ave = (r + iter * r_ave)/(iter + 1)
        time = new TimeSlice(q, s_, r, env, r_ave)
        history[iter] = time
        //TODO start to show history and visualise
        //(User defined parameters, so will select which TimeSlice to view,
        //or can progress at a set speed (maybe add graphs etc later) )
        //Update for next cycle
        s = s_
        iter++
    }
    history[0] = env //first element will be used to figure out context for vis.
    return history
}

//Lots of reused code here, should try and minimise that
function viewTime(){
    pause();
    //Retrieve user defined TimeSlice
    time = document.getElementById("selectTime").value
    document.getElementById("r_ave").value = res[time].r_ave
    //log the TimeSlice info
    /*console.log("History: Agent is in position (" + res[time].ypos+ ","+
    res[time].xpos+") with an updated Q value of "+ res[time].q);*/
    draw(context, res[0], res[time].xpos, res[time].ypos)
}

function run(speed){
	pause();
	var f = function () {
		time++;
		draw(context, res[0], res[time].xpos,
		res[time].ypos);
		document.getElementById("selectTime").value = time;
		document.getElementById("r_ave").value = res[time].r_ave
	}
	interval = setInterval(f, speed)
}

function pause(){
	clearInterval(interval)
}

function increment(){
    pause();
    time++;
    document.getElementById("selectTime").value = time
    document.getElementById("r_ave").value = res[time].r_ave
	/*
    console.log("History: Agent is in position (" + res[time].xpos+ ","+
    res[time].ypos+") with an  updated Q value of "+ res[time].q);*/
    draw(context, res[0], res[time].xpos, res[time].ypos)
}

function slide(time){
	document.getElementById("selectTime").value = time
	document.getElementById("r_ave").value = res[time].r_ave //Maybe graph later
	viewTime();
}

function start() {
    // experiment parameters
    var alpha = document.getElementById("alpha").value;
    var gamma = document.getElementById("gamma").value;
    var epsilon = document.getElementById("epsilon").value;
    var t_max = document.getElementById("t_max").value;
/*
    var gamma = 0.99;
    var epsilon = 0.01;
    var t_max = 1e6*/
    time = 0;
    env = new SimpleEpisodicGrid(map1)
    context = visualize(env)
    agent = new QLearn(env,alpha,gamma,epsilon)
    res = simulate(env,agent,t_max)
    env.optimal_average_reward = 10 / 26 // for map1 (!)
    console.log("Optimal average reward: " + env.optimal_average_reward)
    viewTime();
// todo VISUALISE history / show statistics/etc
}
