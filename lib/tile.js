const r_chocolate = 10
const r_wall = -5
const r_empty = -1

const m_empty = "F"
const m_chocolate = "C"
const m_wall = "W"
const m_dispenser = "D"

const c_empty = "grey"
const c_wall = "black"
const c_chocolate = "yellow"
const c_dispenser = "orange"
const c_agent = "blue"

class Tile {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.reward = function() {return r_empty}
        this.legal = true
        this.color = c_empty
        this.chocolate = false
    }
}

class Wall extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return r_wall}
        this.legal = false
        this.color = c_wall
    }
}

class Chocolate extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return r_chocolate}
        this.legal = false // TODO fix this hack
        this.color = c_chocolate
    }
}

class Dispenser extends Tile {
    constructor(x,y,freq) {
        super(x,y)
        this.freq = freq
        this.color = c_dispenser
        this.num_dispensed = 0
        this.chocolate = false
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
        this.freqs = config.freqs
        var map = Util.arrayCopy(config.map)
        if (config.dispenser_pos != undefined) {
            var dx = config.dispenser_pos.x
            var dy = config.dispenser_pos.y
            map[dx][dy] = m_dispenser
        }
        if (map.length == undefined || map.length == 0) {
            this.M = config.M
            this.N = config.N
        } else {
            this.M = map.length
            this.N = map[0].length
        }
        var didx = 0
        for (var i = 0; i < this.M; i++) {
            this.tiles[i] = new Array(this.N);
            for (var j = 0; j < this.N; j++) {
                var type = map ? map[i][j] : m_empty
                var tile
                if (type == m_empty) {
                    tile = new Tile(i,j)
                } else if (type == m_wall) {
                    tile = new Wall(i,j)
                } else if (type == m_chocolate) {
                    tile = new Chocolate(i,j)
                } else if (type == m_dispenser) {
                    tile = new Dispenser(i,j,this.freqs[didx])
                    this.disp.push([i,j])
                    didx++
                } else {
                    throw `Unknown tile type: ${type} for tile (${i},${j})`
                }
                this.tiles[i][j] = tile
            }
        }
    }
    removeDispenser(i,j) {
        this.tiles[i][j] = new Tile(i,j)
        for (var k = 0; k < this.disp.length; k++) {
            if (this.disp[k][0] != i || this.disp[k][1] != j) {
                continue
            }
            this.disp.splice(k,1)
        }
    }
    addDispenser(i,j,f) {
        this.tiles[i][j] = new Dispenser(i,j,f)
        this.disp.push([i,j])
    }
    getDispenser() {
        return this.getTile(this.disp[0][0],this.disp[0][1])
    }
    getTile(i,j) {
        return this.tiles[i][j]
    }
    getRow(i) {
        return this.tiles[i]
    }
}
