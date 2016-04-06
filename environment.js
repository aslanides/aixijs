class Environment {
    constructor() {
        this.actions = []
        this.reward = 0
        this.optimal_average_reward = 0
    }
    perform(action) {
        throw "Not implemented!"
    }
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
        this.actions = [
            function(e) {return e.move(-1,0)},
            function(e) {return e.move(1,0)},
            function(e) {return e.move(0,1)},
            function(e) {return e.move(0,-1)}
        ]
        this.pos = {
            x : 0,
            y : 0
        }
        this.initial_state = this.encode_percept()
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
    move(xx,yy) {
        var newx = this.pos.x + xx
        var newy = this.pos.y + yy
        if (this.legal(newx,newy)) {
            this.pos.x = newx
            this.pos.y = newy
        }
        return this.encode_percept()
    }
    inbounds(x,y) {
        return !(x < 0 || y < 0 || x >= this.M || y >= this.N)
    }
    legal(x,y) {
        throw "Not implemented!"
    }
}

class EpisodicGrid extends Gridworld {
    constructor(map) {
        super(map)
        this.chocolate = 10;
        this.optimal_average_reward = this.chocolate / 26 // magic number 26 is how many steps to the chocolate from beginning
    }

    legal(newx,newy) {
        if (!this.inbounds(newx,newy)) {
            this.reward = -1
            return false
        }
        var type = this.tiles[newx][newy].type
        if (type == "W") {
            this.reward = -1
            return false;
        } else if (type == "C"){
            this.reward = this.chocolate;
            this.pos.x = 0; this.pos.y = 0;
            return false;
        }
        this.reward = 0;
        return true
    }
}

function Tile(type,x,y) {
    this.type = type;
    this.x = x;
    this.y = y;
}
