class Tile {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.reward = function() {return 0}
        this.legal = true
        this.color = "grey"
        this.chocolate = false
    }
}

class Wall extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return -1}
        this.legal = false
        this.color = "black"
    }
}

class Chocolate extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return 10}
        this.legal = false
        this.color = "yellow"
    }
}

class Dispenser extends Tile {
    constructor(x,y,freq) {
        super(x,y)
        this.freq = freq
        this.color = "orange"
        this.reward = function() {
            var rew = this.chocolate ? 10 : 0
            this.chocolate = false
            return rew
        }
    }
    dispense() {
        if (!this.chocolate) {
            if (Math.random() < freq) {
                this.chocolate = true
            }
        }
    }
}
