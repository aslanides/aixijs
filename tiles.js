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
