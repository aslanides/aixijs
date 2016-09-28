// thx Karpathy :)

class Graph {
	constructor(needsBackprop) {
		this.needsBackprop = needsBackprop;
		this.backprop = [];
	}

	backward() {
		for (let i = this.backprop.length - 1; i >= 0; i--) {
			this.backprop[i](); // tick!
		}
	}

	rowPluck(m, idx) {
		let d = m.d;
		let out = new Matrix(d, 1);
		for (let i = 0, n = d; i < n; i++) {
			out.w[i] = m.w[d * idx + i];
		} // copy over the data

		if (this.needsBackprop) {
			let backward = function () {
				for (let i = 0, n = d; i < n; i++) {
					m.dw[d * idx + i] += out.dw[i];
				}
			};

			this.backprop.push(backward);
		}

		return out;
	}

	tanh(m) {
		let out = new Matrix(m.n, m.d);
		let n = m.w.length;
		for (let i = 0; i < n; i++) {
			out.w[i] = Math.tanh(m.w[i]);
		}

		if (this.needs_backprop) {
			let backward = function () {
					for (let i = 0; i < n; i++) {
						// grad for z = tanh(x) is (1 - z^2)
						let mwi = out.w[i];
						m.dw[i] += (1.0 - mwi * mwi) * out.dw[i];
					}
				};

			this.backprop.push(backward);
		}

		return out;
	}

	sigmoid(m) {
		let out = new Matrix(m.n, m.d);
		let n = m.w.length;
		for (let i = 0; i < n; i++) {
			out.w[i] = sig(m.w[i]);
		}

		if (this.needs_backprop) {
			let backward = function () {
					for (let i = 0; i < n; i++) {
						// grad for z = tanh(x) is (1 - z^2)
						let mwi = out.w[i];
						m.dw[i] += mwi * (1.0 - mwi) * out.dw[i];
					}
				};

			this.backprop.push(backward);
		}

		return out;
	}

	relu(m) {
		let out = new Matrix(m.n, m.d);
		let n = m.w.length;
		for (let i = 0; i < n; i++) {
			out.w[i] = Math.max(0, m.w[i]); // relu
		}

		if (this.needs_backprop) {
			let backward = function () {
				for (let i = 0; i < n; i++) {
					m.dw[i] += m.w[i] > 0 ? out.dw[i] : 0.0;
				}
			};

			this.backprop.push(backward);
		}

		return out;
	}

	mul(m1, m2) {
		// multiply matrices m1 * m2
		Util.assert(m1.d === m2.n, 'matmul dimensions misaligned');

		let n = m1.n;
		let d = m2.d;
		let out = new Matrix(n, d);
		for (let i = 0; i < m1.n; i++) { // loop over rows of m1
			for (let j = 0; j < m2.d; j++) { // loop over cols of m2
				let dot = 0.0;
				for (let k = 0; k < m1.d; k++) { // dot product loop
					dot += m1.w[m1.d * i + k] * m2.w[m2.d * k + j];
				}

				out.w[d * i + j] = dot;
			}
		}

		if (this.needs_backprop) {
			let backward = function () {
					for (let i = 0; i < m1.n; i++) { // loop over rows of m1
						for (let j = 0; j < m2.d; j++) { // loop over cols of m2
							for (let k = 0; k < m1.d; k++) { // dot product loop
								let b = out.dw[d * i + j];
								m1.dw[m1.d * i + k] += m2.w[m2.d * k + j] * b;
								m2.dw[m2.d * k + j] += m1.w[m1.d * i + k] * b;
							}
						}
					}
				};

			this.backprop.push(backward);
		}

		return out;
	}

	add(m1, m2) {
		Util.assert(m1.w.length === m2.w.length);

		let out = new Matrix(m1.n, m1.d);
		for (let i = 0, n = m1.w.length; i < n; i++) {
			out.w[i] = m1.w[i] + m2.w[i];
		}

		if (this.needs_backprop) {
			let backward = function () {
				for (let i = 0, n = m1.w.length; i < n; i++) {
					m1.dw[i] += out.dw[i];
					m2.dw[i] += out.dw[i];
				}
			};

			this.backprop.push(backward);
		}

		return out;
	}

	dot(m1, m2) {
		// m1 m2 are both column vectors
		assert(m1.w.length === m2.w.length);
		let out = new Matrix(1, 1);
		let dot = 0.0;
		for (let i = 0, n = m1.w.length; i < n; i++) {
			dot += m1.w[i] * m2.w[i];
		}

		out.w[0] = dot;
		if (this.needs_backprop) {
			let backward = function () {
				for (let i = 0, n = m1.w.length; i < n; i++) {
					m1.dw[i] += m2.w[i] * out.dw[0];
					m2.dw[i] += m1.w[i] * out.dw[0];
				}
			};

			this.backprop.push(backward);
		}

		return out;
	}

	eltmul(m1, m2) {
		assert(m1.w.length === m2.w.length);

		let out = new Matrix(m1.n, m1.d);
		for (let i = 0, n = m1.w.length; i < n; i++) {
			out.w[i] = m1.w[i] * m2.w[i];
		}

		if (this.needs_backprop) {
			let backward = function () {
				for (let i = 0, n = m1.w.length; i < n; i++) {
					m1.dw[i] += m2.w[i] * out.dw[i];
					m2.dw[i] += m1.w[i] * out.dw[i];
				}
			};

			this.backprop.push(backward);
		}

		return out;
	}

	softmax(m) {
		let out = new Matrix(m.n, m.d); // probability volume
		let maxval = -999999;
		for (let i = 0, n = m.w.length; i < n; i++) { if (m.w[i] > maxval) maxval = m.w[i]; }

		let s = 0.0;
		for (let i = 0, n = m.w.length; i < n; i++) {
			out.w[i] = Math.exp(m.w[i] - maxval);
			s += out.w[i];
		}

		for (let i = 0, n = m.w.length; i < n; i++) { out.w[i] /= s; }

		// no backward pass here needed
		// since we will use the computed probabilities outside
		// to set gradients directly on m
		return out;
	}
}
