class Environment {
    constructor() {
        this.initial_state = 0
        this.actions = []
        this.num_states = 0
        this.reward = 0
        this.optimal_average_reward = 0
    }
    perform(action) {}
}

class Gridworld extends Environment {
    constructor(map) {
        super()
        this.tiles = []
        this.M = map[0].length
        this.N = map.length
        for (var i = 0; i < this.M; i++) {
            this.tiles[i] = new Array(this.N);
            for (var j = 0; j < this.N; j++) {
                var t = new Tile(map[i][j],i,j)
                this.tiles[i][j] = t
            }
        }
        this.num_states = this.M * this.N
    }
}

class EpisodicGrid extends Gridworld {
    constructor(map) {
        super(map)
        this.episodic = typeof episodic === 'boolean' ? episodic : true
        this.pos = {
            x : 0,
            y : 0
        }
        this.chocolate = 10;
        this.initial_state = this.encode_percept()
        this.optimal_average_reward = this.chocolate / 26 // magic number 26 is how many steps to the choclate from beginning
        this.actions = [
            function(e) {return e.move(-1,0)},
            function(e) {return e.move(1,0)},
            function(e) {return e.move(0,1)},
            function(e) {return e.move(0,-1)}
        ]
    }
    consume_chocolate(x,y) {
        /*
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
        */
        this.pos.x = 0
        this.pos.y = 0
    }

    move(xx,yy) {
        this.pos.x = this.pos.x+xx;
        this.pos.y = this.pos.y+yy;
        if (!this.check_move()) {
            this.pos.x = this.pos.x-xx;
            this.pos.y = this.pos.y-yy;
        }
        return this.encode_percept()
    }

    encode_percept() {
        return {
            obs: this.M * this.pos.x + this.pos.y,
            rew : this.reward
        }
    }

    perform(action) {
        return this.actions[action](this)
    }

    check_move() {
        if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= this.M || this.pos.y >= this.N) {
            this.reward = -1
            return false;
        } else {
            var type = this.tiles[this.pos.x][this.pos.y].type
            if (type == "W") {
                this.reward = -1
                return false;
            } else if (type == "C"){
                this.reward = this.chocolate;
                this.consume_chocolate(this.pos.x,this.pos.y);
                return true;
            } else if (type == "T") {
                this.reward = -2;
                return true;
            } else {
                this.reward = 0;
                return true
            }
        }
    }
}

function Tile(type,x,y) {
    this.type = type;
    this.x = x;
    this.y = y;
}
