class Environment {
    constructor() {
        this.actions = []
        this.reward = 0
        this.optimal_average_reward = 0
        this.nu = function() {
            throw "Not implemented"
        }
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
                var type = map[i][j]
                var tile
                if (type == "F") {
                    tile = new Tile(i,j)
                } else if (type == "W") {
                    tile = new Wall(i,j)
                } else if (type == "C") {
                    tile = new Chocolate(i,j)
                } else if (type == "D") {
                    tile = new Dispenser(i,j,Math.random())
                } else {
                    throw "Unknown tile type"
                }
                this.tiles[i][j] = tile
            }
        }
        this.num_states = this.M * this.N
        this.actions = [
            function(e) {return e._move(-1,0)},
            function(e) {return e._move(1,0)},
            function(e) {return e._move(0,1)},
            function(e) {return e._move(0,-1)}
        ]
        this.pos = {
            x : 0,
            y : 0
        }
        this.initial_state = 0
    }
    perform(action) {
        return this.actions[action](this)
    }
    _move(xx,yy) {
        var newx = this.pos.x + xx
        var newy = this.pos.y + yy
        if (!this._inbounds(newx,newy)) {
            this.reward = -1
        } else {
            var t = this.tiles[newx][newy]
            this.reward = t.reward()
            this._dynamics(t)
            if (t.legal) {
                this.pos = {x:newx,y:newy}
            }
        }
        return this._encode_percept()
    }
    _inbounds(x,y) {
        return x >= 0 && y >= 0 && x < this.M && y < this.N
    }
    _dynamics(x,y) {}
    _encode_percept() {
        throw "Not implemented!"
    }
}

class SimpleEpisodicGrid extends Gridworld {
    _encode_percept() {
        var o = this.M * this.pos.x + this.pos.y
        var r = this.reward
        this.nu = function(obs,rew) {
            return obs == o && rew == r ? 1 : 0
        }
        return {
            obs : o,
            rew : r
        }
    }
    _dynamics(tile) {
        if (tile.constructor.name == "Chocolate") {
            this.pos = {x:0,y:0} // "episodic"
        }
    }
}

class DispenserGrid extends Gridworld {
    _dynamics(tile) {

    }
    _encode_percept() {

    }
}
