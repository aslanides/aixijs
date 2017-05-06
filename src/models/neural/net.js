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
		var newNet = new Net();
		for (var i = 0; i < this.layers; i++) {
			newNet.addLayer(this.edges[i].copy(), this.biases[i].copy());
		}

		return newNet;
	}

	update(alpha) {
		for (var i = 0; i < this.layers; i++) {
			this.edges[i].update(alpha);
			this.biases[i].update(alpha); // surely not?
		}
	}

	toJSON() {
		var j = {};
		j.edges = [];
		j.biases = [];
		for (var i = 0; i < this.layers; i++) {
			j.biases.push(this.edges[i].toJSON());
			j.biases.push(this.biases[i].toJSON());
		}

		return j;
	}

	fromJSON(j) {
		for (var i = 0; i < j.edges.length; i++) {
			this.addLayer(new Matrix(1, 1), new Matrix(1, 1));
			this.edges[i].fromJSON(j.edges[i]);
			this.biases[i].fromJSON(j.biases[i]);
		}
	}

	zeroGrads() {
		for (var i = 0; i < this.layers; i++) {
			this.edges[i].gradFillConst(0);
		}
	}

	flattenGrads() {
		var n = 0;
		for (var i = 0; i < this.layers; i++) {
			n += this.edges[i].dw.length;
			n += this.biases[i].dw.length;
		}

		var g = new Matrix(n, 1);
		var idx = 0;
		for (var i = 0; i < this.layers; i++) {
			var mat = this.edges[i];
			for (var i = 0, m = mat.dw.length; i < m; i++) {
				g.w[idx] = mat.dw[i];
				idx++;
			}

			mat = this.biases[i];
			for (var i = 0, m = mat.dw.length; i < m; i++) {
				g.w[idx] = mat.dw[i];
				idx++;
			}
		}

		return g;
	}
}
