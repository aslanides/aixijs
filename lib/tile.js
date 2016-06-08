class Tile {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.reward = function() {return rewards.empty}
        this.legal = true
        this.color = colors.empty
        this.chocolate = false
        this.info = []
		this.percept = 0
    }
	//static new(x,y,cfg)
}

class Wall extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return rewards.wall}
        this.legal = false
        this.color = colors.wall
		this.percept = 1
    }
}

class Chocolate extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return rewards.chocolate}
        this.legal = false // TODO fix this hack
        this.color = colors.chocolate
    }
}

class Dispenser extends Tile {
    constructor(x,y,freq) {
        super(x,y)
        this.freq = freq
        this.color = colors.dispenser
        this.num_dispensed = 0
        this.chocolate = false
        this.reward = function() {
            var rew = this.chocolate ? rewards.chocolate : rewards.empty
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

class Sign extends Wall {
	constructor(x,y,signal) {
		super(x,y)
		this.percept = signal // signal should be in range {2,3,...}
		this.color = colors.sign
	}
}
