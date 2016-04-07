// display constants
const d = 40; //TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50; // TODO event driven frame updates
const D = d + 1; // TODO look at JQuery!

// visualisation

function visualize(env) {
    canvas = document.createElement("canvas");
    canvas.width = D*env.grid.M-1;
    canvas.height = D*env.grid.N-1;
    document.body.insertBefore(this.canvas,document.body.childNodes[0]);
    return canvas.getContext("2d")
}

function draw(ctx,env) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < env.grid.M; i++) {
        for (j = 0; j < env.grid.N; j++) {
            var t = env.grid.get_tile(i,j)
            ctx.fillStyle = t.color
            ctx.fillRect(i*D,j*D,d,d);
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(env.pos.x*D,env.pos.y*D,d,d);
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
*/
