import {assert, sum} from "./util"

export interface Distribution {
	sample(...args: any): number
	prob(x: any): number
}

export class Uniform implements Distribution {
	// A simple uniform distribution U(a, b).
	a: number
	b: number

	constructor(a: number, b: number) {
		assert(b > a);
		this.a = a;
		this.b = b;
	}

	sample(): number {
		return Math.random() * (this.b - this.a) + this.a;
	}

	prob(x: number): number {
		if (x >= this.a && x <= this.b) {
			return 1 / (this.b - this.a);
		} else {
			console.warn(`${x} is outside the support (${this.a}, ${this.b}).`);
			return 0;
		}
	}
}

export class Bernoulli implements Distribution {
	// A simple Bernoulli distribution Bern(p).
	p: number
	constructor(p: number) {
		this.p = p;
	}

	sample(): number {
		return Math.random() < this.p ? 1 : 0;
	}

	prob(x: number): number {
		if (x === 1) {
			return this.p;
		} 
		if (x === 0) {
			return 1 - this.p;
		} 
		console.warn(`${x} is outside the support {0, 1}.`);
		return 0;
	}
}

export class Normal implements Distribution {
	// A standard normal distribution N(mu, sigma)
	mu: number
	sigma: number

	// TODO(aslanides): Fix interface here.
	constructor(mu: number, sigma: number) {
		this.mu = mu
		this.sigma = sigma;
	}

	sample() {
		const theta = 2 * Math.PI * Math.random();
		const r = this.sigma * Math.sqrt(-2 * Math.log(1 - Math.random()));
		return this.mu + r * Math.cos(theta);
	}

	prob(x: number): number {
		return 1 / (Math.sqrt(2 * Math.pow(this.sigma, 2) * Math.PI)) *
			Math.pow(Math.E, -1 * Math.pow(x - this.mu, 2) / (2 * Math.pow(this.sigma, 2)));
	}

	// TODO(aslanides): Fix type annotation here.
	data(numSamples=10000): Array<{x: number, y: number}> {
		// Generates a bunch of samples.
		const xmin = this.mu - 4 * this.sigma;
		const xmax = this.mu + 4 * this.sigma;
		const dx = (xmax - xmin) / numSamples;
		const dat = [];
		for (let x = xmin; x < xmax; x += dx) {
			dat.push({ x, y: this.prob(x) });
		}

		return dat;
	}
}

function factorial(n: number): number {
	assert(n >= 1)
	if (n === 1) return 1;
	return n * factorial(n-1)
}

export class Beta implements Distribution {
	// Standard Beta distribution B(alpha, beta).
	alpha: number
	beta: number

	constructor(alpha: number, beta: number) {
		this.alpha = alpha;
		this.beta = beta;
	}

	prob(p: number) {
		const f = factorial;
		const beta = f(this.alpha) * f(this.beta) / f(this.alpha + this.beta);
		return Math.pow(p, this.alpha - 1) * Math.pow(1 - p, this.beta - 1) / beta;
	}

	sample() {
		// We just return the mean for now.
		// TODO(aslanides): fix this.
		return this.mean();
	}

	mean(): number {
		return this.alpha / (this.alpha + this.beta);
	}

	update(bit: number): void {
		bit ? this.alpha += 1 : this.beta += 1;
	}
}

export class Dirichlet implements Distribution {
	// Standard Dirichlet distribution for categorical variables.

	alphas: number[]
	K: number
	alphaSum: number;

	constructor(alphas: number[]) {
		this.alphas = alphas;
		this.K = alphas.length;
		this.alphaSum = sum(alphas);
	}

	prob(pvec: number[]) {
		assert(pvec.length === this.K);
		assert(sum(pvec) === 1);
		let beta = 1;
		for (let i = 0; i < this.K; i++) {
			beta *= factorial(this.alphas[i]);
		}

		beta /= factorial(sum(this.alphas));
		let out = beta;
		for (let i = 0; i < this.K; i++) {
			out *= Math.pow(pvec[i], this.alphas[i] - 1);
		}

		return out;
	}

	sample(i: number) {
		// We just return the mean for now
		return this.mean(i);
	}

	mean(i: number) {
		if (!this.alphaSum) {
			return 1 / this.K; // Allows for the Haldane prior.
		}

		return this.alphas[i] / this.alphaSum;
	}

	means() {
		const means = [];
		for (let i = 0; i < this.K; i++) {
			means.push(this.mean(i));
		}

		return means;
	}

	update(i: number) { // for performance, only one obs at a time now
		this.alphas[i]++;
		this.alphaSum++;
	}
}
