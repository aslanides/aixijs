class Distribution {
	sample() {
		throw "Not implemented!"
	}
	prob(x) {
		throw "Not implemented!"
	}
}

class UniformDistribution extends Distribution {
	constructor(a,b) {
		Util.assert(b > a)
		this.a = a
		this.b = b
	}
	sample() {
		return Math.random() * (this.b - this.a) + this.a
	}
	prob(x) {
		return 1/(this.b-this.a)
	}
}

class BernoulliDistribution extends Distribution {
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
			throw `${x} is outside the support.`
		}
	}
}

class NormalDistribution extends Distribution {
	constructor(mu,sigma) {
		this.mu = mu
		this.sigma = sigma
	}
	sample() {
		var theta = 2 * Math.PI * Math.random()
		var r = this.sigma * Math.sqrt(-2 * Math.log(1-Math.random()))
		return this.mu + r * Math.cos(theta)
	}
	prob(x) {
		return 1/(Math.sqrt(2 * Math.pow(this.sigma,2) * Math.PI)) * Math.pow(Math.E,-1*Math.pow(x-this.mu,2)/(2*Math.pow(this.sigma,2)))
	}
}
