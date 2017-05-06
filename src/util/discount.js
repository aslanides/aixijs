class Discount {
	constructor() {
		return _ => 1;
	}
}

class MatrixDiscount {
	constructor(params) {
		let discounts = Util.arrayCopy(params.discounts);
		let times = Util.arrayCopy(params.discountChanges);
		let idx = 0;
		let current = discounts[idx];
		idx++;

		return (dfr, t) => {
			if (t == times[idx]) {
				current = discounts[idx];
				idx++;
			}

			return current(dfr);
		};
	}
}

class GeometricDiscount {
	constructor(params) {
		let gamma = params.gamma;
		return dfr => Math.pow(gamma, dfr);
	}
}

class HyperbolicDiscount {
	constructor(params) {
		let beta = params.beta;
		let kappa = params.kappa;
		return dfr => Math.pow(1 + kappa * dfr, -beta);
	}
}

class PowerDiscount {
	constructor(params) {
		let beta = params.beta;
		return (dfr, t) => Math.pow(dfr + t, -beta);
	}
}

class ConstantHorizonDiscount {
	constructor(params) {
		let horizon = params.horizon;
		return dfr => dfr < horizon ? 1 : 0;
	}
}

class CustomDiscount extends Discount {
	constructor(params) {
		let vector = Util.arrayCopy(params.vector);
		return dfr => vector[dfr];
	}
}
