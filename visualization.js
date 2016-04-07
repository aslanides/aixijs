// display constants
const d = 40; //TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50; // TODO event driven frame updates
const D = d + 1; // TODO look at JQuery!

//Not sure if these should be global
var history;
var res;
var context;
var time;
var interval;
class TimeSlice {
	constructor(q, obs, reward, envt,r_ave) {
		this.q = q; // TODO Make abstract for other agents
		this.obs = obs;
		this.reward = reward
		this.xpos = envt.pos.x
		this.ypos = envt.pos.y
		this.r_ave = r_ave
	}
}

class Visualisation {
	// TODO
}

function visualize(env) {
    canvas = document.createElement("canvas");
    canvas.width = D*env.grid.M-1;
    canvas.height = D*env.grid.N-1;
    document.body.insertBefore(this.canvas,document.body.childNodes[0]);
    return canvas.getContext("2d")
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

function draw(ctx,env, x, y) { //Change this later for more general agents
  //(difference right now is only in position) (At *)
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < env.grid.M; i++) {
        for (j = 0; j < env.grid.N; j++) {
            var t = env.grid.get_tile(i,j)
            ctx.fillStyle = t.color
            ctx.fillRect(i*D,j*D,d,d);
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(x*D,y*D,d,d); //*
    // document.getElementById("score").textContent="Total reward: "+ env.score;
}

// for human control
/*
setInterval(function() {draw(canvas.getContext("2d"),env)},1000/fps);
window.addEventListener("keydown",
    function(e) {
        if (e.keyCode == 37) {env.moveleft()}
        if (e.keyCode == 39) {env.moveright()}
        if (e.keyCode == 38) {env.moveup()}
        if (e.keyCode == 40) {env.movedown()}
})
}
*/
