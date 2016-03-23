var Environment = function(map,episodic) {
    this.episodic = typeof episodic === 'boolean' ? episodic : true
    this.tiles = []
    this.pos = {
        x : 0,
        y : 0
    }
    this.score = 0;
    this.reward = 0;
    this.chocolate = 10;
    this.M = map[0].length
    this.N = map.length
    this.actions = [
        function(e) {return e.moveleft()},
        function(e) {return e.moveright()},
        function(e) {return e.moveup()},
        function (e){return e.movedown()}
    ]
    this.num_states = this.M * this.N
    for (i = 0; i < this.M; i++) {
        this.tiles[i] = new Array(this.N);
        for (j = 0; j < this.N; j++) {
            var t = new Tile(map[i][j],i,j)
            this.tiles[i][j] = t
        }
    }
}

Environment.prototype = {
    _consume_chocolate : function(x,y) {
        if (!this.episodic) {
            this.tiles[x][y].type = "F"
            var i; var j;
            while (true) {
                i = Math.floor(Math.random() * this.M)
                j = Math.floor(Math.random() * this.N)
                if (this.tiles[i][j].type == "F") {
                    this.tiles[i][j].type = "C"
                    break
                }
            }
        } else {
            this.pos.x = 0
            this.pos.y = 0
        }
    },

    _move : function(xx,yy) {
        this.pos.x = this.pos.x+xx;
        this.pos.y = this.pos.y+yy;
        if (!this._check_move()) {
            this.pos.x = this.pos.x-xx;
            this.pos.y = this.pos.y-yy;
        }
        return this._encode_percept()
    },

    _encode_percept : function() {
        return {
            obs: this.M * this.pos.x + this.pos.y,
            rew : this.reward
        }
    },

    _check_move : function() {
        if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= this.M || this.pos.y >= this.N) {
            this.reward = -1
            this.score += this.reward
            return false;
        } else {
            var type = this.tiles[this.pos.x][this.pos.y].type
            if (type == "W") {
                this.reward = -1
                this.score += this.reward
                return false;
            } else if (type == "C"){
                this.reward = this.chocolate;
                this.score += this.reward;
                this._consume_chocolate(this.pos.x,this.pos.y);
                return true;
            } else if (type == "T") {
                this.reward = -2;
                this.score += this.reward
                return true;
            } else {
                this.reward = 0;
                return true
            }
        }
    },

    do : function(a) {
        return this.actions[a](this)
    },

    moveleft : function() {return this._move(-1,0)},
    moveright : function() {return this._move(1,0)},
    moveup : function() {return this._move(0,-1)},
    movedown : function() {return this._move(0,1)},
}

function Tile(type,x,y) {
    this.type = type;
    this.x = x;
    this.y = y;
}
