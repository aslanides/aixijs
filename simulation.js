var params = {
    agent : {
        epsilon : 0.01,
        gamma : 0.99,
        alpha: 0.1,
    },
    environment : {
        allowed_actions : ["L","R","U","D"],
        M : 9,
        N : 9
    }
}
var map = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","T","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","T","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

// constants
const N = 9;
const d = 40; //TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50; // TODO event driven frame updates
const D = d + 1; // TODO look at JQuery!

// visualisation
canvas = document.createElement("canvas");
canvas.width = D*N-1;
canvas.height = D*N-1;
document.body.insertBefore(this.canvas,document.body.childNodes[0]);

function draw(ctx,env) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
            env.tiles[i][j].draw(ctx)
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(env.playerx*D,env.playery*D,d,d);
    document.getElementById("score").textContent=env.score;
}

function start() {
    agent = new QLearn(params)
    env = new Environment(map)
    setInterval(function() {draw(canvas.getContext("2d"),env)},1000/fps);
    window.addEventListener("keydown",
        function(e) {
            if (e.keyCode == 37) {env.moveleft()}
            if (e.keyCode == 39) {env.moveright()}
            if (e.keyCode == 38) {env.moveup()}
            if (e.keyCode == 40) {env.movedown()}
    })
    for (i = 0; i < 100; i++) {

    }

}
