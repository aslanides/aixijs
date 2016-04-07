// display constants
const d = 40; //TODO don't hard code pixel sizes

var history;
var res;
var context;
var time;
var interval;
class TimeSlice {
	constructor(q,obs,reward,envt,r_ave) {
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
    canvas.width = (d+1)*env.grid.M-1;
    canvas.height = (d+1)*env.grid.N-1;
    document.body.insertBefore(this.canvas,document.body.childNodes[0]);
    return canvas.getContext("2d")
}

function viewTime(){
    pause();
    time = document.getElementById("selectTime").value
    document.getElementById("r_ave").value = res[time].r_ave
    draw(context, res[0], res[time].xpos, res[time].ypos)
}

function run(speed){
	pause();
	var f = function () {
		time++;
		draw(context, res[0], res[time].xpos,res[time].ypos);
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
    draw(context, res[0], res[time].xpos, res[time].ypos)
}

function slide(time){
	document.getElementById("selectTime").value = time
	document.getElementById("r_ave").value = res[time].r_ave
	viewTime();
}

function draw(ctx,env, x, y) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < env.grid.M; i++) {
        for (j = 0; j < env.grid.N; j++) {
            var t = env.grid.get_tile(i,j)
            ctx.fillStyle = t.color
            ctx.fillRect(i*(d+1),j*(d+1),d,d);
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(x*(d+1),y*(d+1),d,d); //*
}

// for human control
/*
setInterval(function() {draw(canvas.getContext("2d"),env)},20);
	window.addEventListener("keydown",
	    function(e) {
	        if (e.keyCode == 37) {env.moveleft()}
	        if (e.keyCode == 39) {env.moveright()}
	        if (e.keyCode == 38) {env.moveup()}
	        if (e.keyCode == 40) {env.movedown()}
		})
}
*/
