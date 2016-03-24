// constants
const d = 40; //TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50; // TODO event driven frame updates
const D = d + 1; // TODO look at JQuery!

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
    // document.getElementById("score").textContent="Total reward: "+ env.score;
}
