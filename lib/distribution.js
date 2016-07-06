class UniformDistribution {
	constructor(a,b) {
		Util.assert(b > a)
		this.a = a
		this.b = b
	}
	sample() {
		return Math.random() * (this.b - this.a) + this.a
	}
	prob(x) {
		if (x >= a && x <= b) {
			return 1/(this.b-this.a)
		} else {
			console.warn(`${x} is outside the support.`)
			return 0
		}
	}
}

class BernoulliDistribution {
	constructor(p) {
		this.p = p
	}
	sample() {
		return Math.random() < this.p ? 1 : 0
	}
	prob(x) {
		if (x == 1) {
			return this.p
		} else if (x == 0) {
			return 1-this.p
		} else {
			console.warn(`${x} is outside the support.`)
			return 0
		}
	}
}

class NormalDistribution {
	constructor(params) {
		this.mu = params.mu
		this.sigma = params.sigma
	}
	sample() {
		var theta = 2 * Math.PI * Math.random()
		var r = this.sigma * Math.sqrt(-2 * Math.log(1-Math.random()))
		return this.mu + r * Math.cos(theta)
	}
	prob(x) {
		return 1/(Math.sqrt(2 * Math.pow(this.sigma,2) * Math.PI)) * Math.pow(Math.E,-1*Math.pow(x-this.mu,2)/(2*Math.pow(this.sigma,2)))
	}
	data() {
		var xmin = this.mu - 4 * this.sigma
		var xmax = this.mu + 4 * this.sigma
		var dx = (xmax-xmin)/10000
		var dat = []
		for (var x = xmin; x < xmax; x += dx) {
			dat.push({x:x,y:this.prob(x)})
		}
		return dat
	}
}
