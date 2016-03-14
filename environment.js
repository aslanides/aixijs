function Environment(map) {
    this.tiles = [];
    this.player;
    this.score;

    var penalty = 1;
    var reward = 10;
    var score = 0;

    for (i = 0; i < N; i++) {
        tiles[i] = new Array(N);
        for (j = 0; j < N; j++) {
            var t = new Tile(map[i][j],i,j)
            t.update()
            this.tiles[i][j] = t
        }
    }

    this.player = new Player(0,0)
    this.actions = [player.moveleft,player.moveright,player.moveup,player.movedown]

    this.get_state = function() {
        return [player.x, player.y]
    }

    this.newChocolate = function() {
        var i = Math.floor(Math.random() * N);
        var j = Math.floor(Math.random() * N);
        if (tiles[i][j].type == "floor") {
            tiles[i][j].type = "chocolate"
        } else {
            newChocolate();
        }
    }

    this.update = function() {
        this.visualisation.clear();
        for (i = 0; i < N; i++) {
            for (j = 0; j < N; j++) {
                tiles[i][j].update()
            }
        }
        player.update()
        document.getElementById("score").textContent=score;
        }
    }

    this.visualisation = {
        canvas : document.createElement("canvas"),
        context : {},
        start : function() {
            this.canvas.width = D*N-1;
            this.canvas.height = D*N-1;
            this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas,document.body.childNodes[0]);
            this.interval = setInterval(this.update,1000/fps);
            window.addEventListener("keydown",
                function(e) {
                    if (e.keyCode == 37) {player.moveleft()}
                    if (e.keyCode == 39) {player.moveright()}
                    if (e.keyCode == 38) {player.moveup()}
                    if (e.keyCode == 40) {player.movedown()}
            })
            window.addEventListener("keyup",
                function(e) {
            })
        },
        clear : function() {
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        }
    }

}

function Tile(type,x,y) {
    this.type = type;
    this.height = d;
    this.width = d;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = gridView.context;
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

function Player(x,y) {
    this.x = x;
    this.y = y;
    this.height = d;
    this.width = d;
    this.update = function() {
        ctx = gridView.context;
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x*D,this.y*D,this.width,this.height);
    }

    this.checkMove = function() {
        if (this.x < 0 || this.y < 0 || this.x >= N || this.y >= N) {
            score -= penalty;
            return false;
        } else {
            var type = tiles[this.x][this.y].type
            if (type == "W") {
                score -= penalty;
                return false;
            } else if (type == "C"){
                score += reward;
                tiles[this.x][this.y].type = "F"
                newChocolate();
                return true;
            } else if (type == "T") {
                score -= 2 * penalty;
                return true;
            }
        }
        return true;
    }

    this.move(xx,yy) = function() {
        this.x = this.x+xx;
        this.y = this.y+yy;
        if (!this.checkMove()) {
            this.x = this.x-xx;
            this.y = this.y-yy;
        }
    }

    this.moveleft = this.move(-1,0)
    this.moveright = this.move(1,0)
    this.moveup = this.move(0,-1)
    this.movedown = this.move(0,1)
}
