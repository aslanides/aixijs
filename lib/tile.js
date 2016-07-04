class Tile {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.reward = function() {return config.rewards.empty}
        this.legal = true
        this.color = config.colors.empty
        this.chocolate = false
        this.info = []
		this.obs = ''

		this.connexions = new Array(config.grid_topology)
    }
	add_connexion(i,j,t) {
		this.connexions[2*i + j] = t
	}
	get_connexion(i,j) {
		return this.connexions[2*i + j]
	}
	static new(i,j,cfg,type) {
		var tile
		if (type == config.map_symbols.empty) {
			tile = new Tile(i,j)
		} else if (type == config.map_symbols.wall) {
			tile = new Wall(i,j)
		} else if (type == config.map_symbols.chocolate) {
			tile = new Chocolate(i,j)
		} else if (type == config.map_symbols.dispenser) {
			tile = new Dispenser(i,j,cfg.freq)
		} else if (type == config.map_symbols.sign) {
			tile = new Sign(i,j,cfg.signal)
		} else {
			throw `Error: unknown Tile type: ${type}.`
		}
		return tile
	}
}

class Wall extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return config.rewards.wall}
        this.legal = false
        this.color = config.colors.wall
		this.percept = 1
    }
}

class Chocolate extends Tile {
    constructor(x,y) {
        super(x,y)
        this.reward = function() {return config.rewards.chocolate}
        this.color = config.colors.chocolate
    }
}

class Dispenser extends Tile {
    constructor(x,y,freq) {
        super(x,y)
        this.freq = freq
        this.color = config.colors.dispenser
        this.num_dispensed = 0
        this.chocolate = false
        this.reward = function() {
            var rew = this.chocolate ? config.rewards.chocolate : config.rewards.empty
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
		this.percept = signal // signal should be in {2,3}
		this.color = config.colors.sign
	}
}

class Tiger extends Tile {
	constructor(x,y) {
		super(x,y)
		this.percept = 6
		this.color = config.colors.tiger
	}
}
