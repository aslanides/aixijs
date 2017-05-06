class Solver {
	constructor() {
		this.decay_rate = 0.999;
		this.smooth_eps = 1e-8;
		this.step_cache = {};
	}

	step(model, stepSize, regc, clipval) {
		// perform parameter update
		let solverStats = {};
		let numClipped = 0;
		let numTot = 0;
		for (let k in model) {
			if (model.hasOwnProperty(k)) {
				let m = model[k]; // mat ref
				if (!(k in this.step_cache)) { this.step_cache[k] = new Matrix(m.n, m.d); }

				let s = this.step_cache[k];
				for (let i = 0, n = m.w.length; i < n; i++) {

					// rmsprop adaptive learning rate
					let mdwi = m.dw[i];
					s.w[i] = s.w[i] * this.decay_rate + (1.0 - this.decay_rate) * mdwi * mdwi;

					// gradient clip
					if (mdwi > clipval) {
						mdwi = clipval;
						numClipped++;
					}

					if (mdwi < -clipval) {
						mdwi = -clipval;
						numClipped++;
					}

					numTot++;

					// update (and regularize)
					m.w[i] += -stepSize * mdwi / Math.sqrt(s.w[i] + this.smooth_eps) - regc * m.w[i];
					m.dw[i] = 0; // reset gradients for next iteration
				}
			}
		}

		solverStats.ratio_clipped = numClipped * 1.0 / numTot;
		return solverStats;
	}
}
