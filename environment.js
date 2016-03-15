canvas = document.createElement("canvas");
ctx = this.canvas.getContext("2d");
canvas.width = D*N-1;
canvas.height = D*N-1;
document.body.insertBefore(this.canvas,document.body.childNodes[0]);

var Environment = function() {
    this.tiles = []
    this.playerx = 0
    this.playery = 0

    this.penalty = 1;
    this.reward = 10;
    this.score = 0;
}

function update(env) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
            env.tiles[i][j].update()
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(env.playerx*D,env.playery*D,d,d);
    document.getElementById("score").textContent=env.score;
}

Environment.prototype = {
    init : function(map) {
        for (i = 0; i < N; i++) {
            this.tiles[i] = new Array(N);
            for (j = 0; j < N; j++) {
                var t = new Tile(map[i][j],i,j)
                t.update()
                this.tiles[i][j] = t
            }
        }
    },
    new_chocolate : function() {
        var i; var j;
        while (true) {
            i = Math.floor(Math.random() * N)
            j = Math.floor(Math.random() * N)
            if (this.tiles[i][j].type == "F") {
                this.tiles[i][j].type = "C"
                break
            }
        }
    },
    check_move : function() {
        if (this.playerx < 0 || this.playery < 0 || this.playerx >= N || this.playery >= N) {
            this.score -= env.penalty;
            return false;
        } else {
            var type = this.tiles[this.playerx][this.playery].type
            if (type == "W") {
                this.score -= env.penalty;
                return false;
            } else if (type == "C"){
                this.score += env.reward;
                env.tiles[this.playerx][this.playery].type = "F"
                this.new_chocolate();
                return true;
            } else if (type == "T") {
                this.score -= 2 * env.penalty;
                return true;
            }
        }
        return true;
    },

    move : function(xx,yy) {
        this.playerx = this.playerx+xx;
        this.playery = this.playery+yy;
        if (!this.check_move()) {
            this.playerx = this.playerx-xx;
            this.playery = this.playery-yy;
        }
    },

    moveleft : function() {this.move(-1,0)},
    moveright : function() {this.move(1,0)},
    moveup : function() {this.move(0,-1)},
    movedown : function() {this.move(0,1)},

}

function Tile(type,x,y) {
    this.type = type;
    this.height = d;
    this.width = d;
    this.x = x;
    this.y = y;
    this.update = function() {
        if (this.type == "W") {
            ctx.fillStyle = "black";
        } else if (this.type == "F") {
            ctx.fillStyle = "red";
        } else if (this.type == "C"){
            ctx.fillStyle = "yellow";
        } else if (this.type == "T") {
            ctx.fillStyle = "pink";
        } else {
            ctx.fillStyle = "green";
        }
        ctx.fillRect(this.x*D,this.y*D,this.width,this.height);
    }
}
