class Net {
	constructor() {
		this.edges = [];
		this.biases = [];
		this.layers = 0;
	}

	addLayer(m, b) {
		this.edges.push(m);
		this.biases.push(b);
		this.layers++;
	}

	copy() {
		let newNet = new Net();
		for (let i = 0; i < this.layers; i++) {
			newNet.addLayer(this.edges[i].copy(), this.biases[i].copy());
		}

		return newNet;
	}

	update(alpha) {
		for (let i = 0; i < this.layers; i++) {
			this.edges[i].update(alpha);
			this.biases[i].update(alpha); // surely not?
		}
	}

	toJSON() {
		let j = {};
		j.edges = [];
		j.biases = [];
		for (let i = 0; i < this.layers; i++) {
			j.biases.push(this.edges[i].toJSON());
			j.biases.push(this.biases[i].toJSON());
		}

		return j;
	}

	fromJSON(j) {
		for (let i = 0; i < j.edges.length; i++) {
			this.addLayer(new Matrix(1, 1), new Matrix(1, 1));
			this.edges[i].fromJSON(j.edges[i]);
			this.biases[i].fromJSON(j.biases[i]);
		}
	}

	zeroGrads() {
		for (let i = 0; i < this.layers; i++) {
			this.edges[i].gradFillConst(0);
		}
	}

	flattenGrads() {
		let n = 0;
		for (let i = 0; i < this.layers; i++) {
			n += this.edges[i].dw.length;
			n += this.biases[i].dw.length;
		}

		let g = new Matrix(n, 1);
		let idx = 0;
		for (let i = 0; i < this.layers; i++) {
			let mat = this.edges[i];
			for (let i = 0, m = mat.dw.length; i < m; i++) {
				g.w[idx] = mat.dw[i];
				idx++;
			}

			mat = this.biases[i];
			for (let i = 0, m = mat.dw.length; i < m; i++) {
				g.w[idx] = mat.dw[i];
				idx++;
			}
		}

		return g;
	}
}
