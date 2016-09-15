class Matrix {
	constructor(n, d) {
		this.n = n;
		this.d = d;
		this.w = Util.zeros(n * d);
		this.dw = Util.zeros(n * d);
	}

	get(row, col) {
		return this.w[(this.d * row) + col];
	}

	set(row, col, val) {
		this.w[(this.d * row) + col] = val;
	}

	setFrom(arr) {
		this.w = [...arr];
	}

	setColumn(m, i) {
		for (let q = 0, n = m.w.length; q < n; q++) {
			this.w[(this.d * q) + i] = m.w[q];
		}
	}

	toJSON() {
		return {
			n: this.n,
			d: this.d,
			w: this.w,
		};
	}

	fromJSON(json) {
		this.n = json.n;
		this.d = json.d;
		this.dw = Util.zeros(this.n * this.d);
		this.w = Util.zeros(this.n * this.d);
		for (let i = 0, n = this.n * this.d; i < n; i++) {
			this.w[i] = json.w[i];
		}
	}

	copy() {
		let a = new Matrix(this.n, this.d);
		a.setFrom(this.w);
		return a;
	}

	update(alpha) {
		for (let i = 0, n = this.n * this.d; i < n; i++) {
			if (this.dw[i] !== 0) {
				this.w[i] += -alpha * this.dw[i];
				this.dw[i] = 0;
			}
		}
	}

	fillRandn(mu, std) {
		for (let i = 0, n = this.w.length; i < n; i++) {
			this.w[i] = Util.randn(mu, std);
		}
	}

	fillRand(lo, hi) {
		for (let i = 0, n = this.w.length; i < n; i++) {
			this.w[i] = Util.randf(lo, hi);
		}
	}

	gradFillConst(c) {
		for (let i = 0, n = m.dw.length; i < n; i++) {
			m.dw[i] = c;
		}
	}

	static rand(n, d, mu, sigma) {
		let m = new Matrix(n, d);
		m.fillRandn(mu, sigma);

		return m;
	}
}
