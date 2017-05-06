class Discount {
	constructor() {
		return _ => 1;
	}
}

class MatrixDiscount {
	constructor(params) {
		var discounts = Util.arrayCopy(params.discounts);
		var times = Util.arrayCopy(params.discountChanges);
		var idx = 0;
		var current = discounts[idx];
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
		var gamma = params.gamma;
		return dfr => Math.pow(gamma, dfr);
	}
}

class HyperbolicDiscount {
	constructor(params) {
		var beta = params.beta;
		var kappa = params.kappa;
		return dfr => Math.pow(1 + kappa * dfr, -beta);
	}
}

class PowerDiscount {
	constructor(params) {
		var beta = params.beta;
		return (dfr, t) => Math.pow(dfr + t, -beta);
	}
}

class ConstantHorizonDiscount {
	constructor(params) {
		var horizon = params.horizon;
		return dfr => dfr < horizon ? 1 : 0;
	}
}

class CustomDiscount extends Discount {
	constructor(params) {
		var vector = Util.arrayCopy(params.vector);
		return dfr => vector[dfr];
	}
}
