var map1 = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","T","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","T","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

var map2 =[["F","F","F"],
        ["F","W","F"],
        ["F","W","C"]]

var map3 = [["F","F","F","F","F"],
            ["F","W","W","W","F"],
            ["F","F","W","F","F"],
            ["W","F","F","F","W"],
            ["W","W","C","W","W"]]

// constants
const d = 40; //TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50; // TODO event driven frame updates
const D = d + 1; // TODO look at JQuery!

var alpha = 0.9
var gamma = 0.99
var epsilon = 0.3

// visualisation

function visualize(env) {
    canvas = document.createElement("canvas");
    canvas.width = D*env.M-1;
    canvas.height = D*env.N-1;
    document.body.insertBefore(this.canvas,document.body.childNodes[0]);
    return canvas.getContext("2d")
}

/*
setInterval(function() {draw(canvas.getContext("2d"),env)},1000/fps);
window.addEventListener("keydown",
    function(e) {
        if (e.keyCode == 37) {env.moveleft()}
        if (e.keyCode == 39) {env.moveright()}
        if (e.keyCode == 38) {env.moveup()}
        if (e.keyCode == 40) {env.movedown()}
})
*/

function draw(ctx,env) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < env.M; i++) {
        for (j = 0; j < env.N; j++) {
            var t = env.tiles[i][j].type
            if (t == "W") {
                ctx.fillStyle = "black";
            } else if (t == "F") {
                ctx.fillStyle = "red";
            } else if (t == "C"){
                ctx.fillStyle = "yellow";
            } else if (t == "T") {
                ctx.fillStyle = "pink";
            } else {
                ctx.fillStyle = "green";
            }
            ctx.fillRect(i*D,j*D,d,d);
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(env.pos.x*D,env.pos.y*D,d,d);
    document.getElementById("score").textContent=env.score;
}

function start() {
    env = new Environment(map3)
    ctx = visualize(env)
    agent = new QLearn(env,alpha,gamma,epsilon)
    lens = []
    l = 0
    s = 0
    for (iter = 0; iter < 5e6; iter++) {
        l += 1
        a = agent.select_action(s)
        percept = env.do(a)
        s_ = percept.obs
        r = percept.rew
        if (r == env.chocolate) {
            lens.push(l)
            l = 0
        }
        agent.update_Q(s,a,r,s_)
        s = s_
    }
    draw(ctx,env)
    console.log(lens)
    sum = 0
    for (i = 0;i < lens.length; i++) {
        sum += lens[i]
    }
    console.log(sum/lens.length)
    console.log(agent.Q)
}
