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
    constructor(config) {
        super()
        this.tiles = []
        var map = config.map
        this.M = map[0].length
        this.N = map.length
        var didx = 0
        this.disp = []
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
                    tile = new Dispenser(i,j,config.freqs[didx])
                    this.disp[didx] = [i,j]
                    didx++
                } else {
                    throw "Unknown tile type"
                }
                this.tiles[i][j] = tile
            }
        }
        this.optimal_average_reward = config.optimal_average_reward
        this.num_states = this.M * this.N
        this.actions = [
            function(e) {return e._move(-1,0)},
            function(e) {return e._move(1,0)},
            function(e) {return e._move(0,1)},
            function(e) {return e._move(0,-1)},
            function(e) {return e._move(0,0)}
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
    _dynamics(tile) {}
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

class SimpleDispenserGrid extends Gridworld {
    _encode_percept() {
        var percept = new Array(9)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var tt = this.tiles[this.pos.x-1+i]
                if (tt == undefined) {
                    percept[3*i+j] = 1
                    continue
                }
                var t = tt[this.pos.y-1+j]
                if (t == undefined) {
                    percept[3*i+j] = 1
                    continue
                } else if (t.constructor.name == "Tile") {
                    percept[3*i+j] = 0
                } else {
                    percept[3*i+j] = 1
                }
            }
        }
        return {
            obs : percept.join(""),
            rew : this.reward
        }
    }
    _dynamics(tile) {
        for (var val of this.disp) {
            this.tiles[val[0]][val[1]].dispense()
        }
    }
}
