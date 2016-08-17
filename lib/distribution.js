class Uniform {
	constructor(a, b) {
		Util.assert(b > a);
		this.a = a;
		this.b = b;
	}

	sample() {
		return Math.random() * (this.b - this.a) + this.a;
	}

	prob(x) {
		if (x >= a && x <= b) {
			return 1 / (this.b - this.a);
		} else {
			console.warn(`${x} is outside the support.`);
			return 0;
		}
	}
}

class Bernoulli {
	constructor(p) {
		this.p = p;
	}

	sample() {
		return Math.random() < this.p ? 1 : 0;
	}

	prob(x) {
		if (x == 1) {
			return this.p;
		} else if (x == 0) {
			return 1 - this.p;
		} else {
			console.warn(`${x} is outside the support.`);
			return 0;
		}
	}
}

class Normal {
	constructor(params) {
		this.mu = params.mu;
		this.sigma = params.sigma;
	}

	sample() {
		let theta = 2 * Math.PI * Math.random();
		let r = this.sigma * Math.sqrt(-2 * Math.log(1 - Math.random()));
		return this.mu + r * Math.cos(theta);
	}

	prob(x) {
		return 1 / (Math.sqrt(2 * Math.pow(this.sigma, 2) * Math.PI)) *
			Math.pow(Math.E, -1 * Math.pow(x - this.mu, 2) / (2 * Math.pow(this.sigma, 2)));
	}

	data() {
		let xmin = this.mu - 4 * this.sigma;
		let xmax = this.mu + 4 * this.sigma;
		let dx = (xmax - xmin) / 10000;
		let dat = [];
		for (let x = xmin; x < xmax; x += dx) {
			dat.push({ x: x, y: this.prob(x) });
		}

		return dat;
	}
}

class Beta {
	constructor(alpha, beta) {
		this.alpha = alpha;
		this.beta = beta;
	}

	prob(p) {
		let f = math.factorial;
		let beta = f(this.alpha) * f(this.beta) / f(this.alpha + this.beta);
		return math.pow(p, this.alpha - 1) * math.pow(1 - p, this.beta - 1) / beta;
	}

	sample() {
		// just return the mean for now
		return this.mean();
	}

	mean() {
		return this.alpha / (this.alpha + this.beta);
	}

	update(bit) {
		bit ? this.alpha += 1 : this.beta += 1;
	}
}

class Dirichlet {
	constructor(alphas) {
		this.alphas = alphas;
		this.K = alphas.length;
		this.alphaSum = Util.sum(alphas) || 1; // admits the Haldane prior
	}

	prob(pvec) {
		Util.assert(pvec.length == this.K);
		Util.assert(Util.sum(pvec) == 1);
		let beta = 1;
		for (let i = 0; i < this.K; i++) {
			beta *= math.factorial(this.alphas[i]);
		}

		beta /= math.factorial(Util.sum(this.alphas));
		out = beta;
		for (let i = 0; i < this.K; i++) {
			out *= math.pow(pvec[i], this.alphas[i] - 1);
		}

		return out;
	}

	sample(i) {
		// just return the mean for now
		return this.mean(i);
	}

	mean(i) {
		return this.alphas[i] / this.alphaSum;
	}

	means() {
		let means = [];
		for (let i = 0; i < this.K; i++) {
			means.push(this.mean(i));
		}

		return means;
	}

	update(bitvec) {
		for (let i = 0; i < this.K; i++) {
			let c = bitvec[i];
			if (c) {
				this.alphas[i] += c;
				this.alphaSum += c;
				break;
			}
		}
	}
}
