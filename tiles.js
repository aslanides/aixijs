var r_chocolate = 10
var r_wall = -1
var r_empty = 0

class Tile {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.reward = function() {return r_empty}
        this.legal = true
        this.color = "grey"
        this.chocolate = false
    }
}

class Wall extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return r_wall}
        this.legal = false
        this.color = "black"
    }
}

class Chocolate extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return r_chocolate}
        this.legal = false // TODO fix this hack
        this.color = "yellow"
    }
}

class Dispenser extends Tile {
    constructor(x,y,freq) {
        super(x,y)
        this.freq = freq
        this.color = "orange"
        this.num_dispensed = 0
        this.reward = function() {
            var rew = this.chocolate ? r_chocolate : r_empty
            this.chocolate = false
            return rew
        }
    }
    dispense() {
        if (!this.chocolate) {
            if (Math.random() < this.freq) {
                this.num_dispensed++
                this.chocolate = true
            }
        }
    }
}

class Grid {
    constructor(config) {
        this.tiles = []
        this.disp = []
        var map = config.map
        this.M = map[0].length
        this.N = map.length
        var didx = 0
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
                    this.disp.push([i,j])
                    didx++
                } else {
                    throw "Unknown tile type"
                }
                this.tiles[i][j] = tile
            }
        }
    }
    remove_dispenser(i,j) {
        this.tiles[i][j] = new Tile(i,j)
        for (var k = 0; k < this.disp.length; k++) {
            if (this.disp[k][0] != i || this.disp[k][1] != j) {
                continue
            }
            this.disp.splice(k,1)
        }
    }
    add_dispenser(i,j,f) {
        this.tiles[i][j] = new Dispenser(i,j,f)
        this.disp.push([i,j])
    }
    get_tile(i,j) {
        return this.tiles[i][j]
    }
    get_row(i) {
        return this.tiles[i]
    }
}
