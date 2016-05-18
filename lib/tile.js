const r_chocolate = 100
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
        //info to display on tile (e.g. Q-values)
        this.info = []
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
