class Discount {
	constructor() {
		return;
	}

	getValue(dfr) {
		return 1;
	}
}

class ArrayDiscount {
	constructor(discounts, discountChanges) {
		//arrays of which discount functions to use and when
		// (have it as a parameter for now, predefined vectors later...)
		this.discount_array = discounts;
		this.times = discountChanges;
		this.current_discount_index = 0;
		this.current_discount = this.discount_array[this.current_discount_index];
		this.current_discount_index++;
	}

	getValue(dfr, t) {
		if (t == this.times[this.current_discount_index]) {
			this.current_discount = this.discount_array[this.current_discount_index];
			this.current_discount_index++;

			//relies on this function being called with monotonically increasing time values
		}

		return this.current_discount.getValue(dfr);
	}
}

class GeometricDiscount {
	constructor(gamma) {
		this.gamma = gamma;
	}

	getValue(dfr) {
		return Math.pow(this.gamma, dfr);
	}
}

class HyperbolicDiscount {
	constructor(kappa, beta) {
		this.kappa = kappa;
		this.beta = beta;
	}

	getValue(dfr) {
		return (1 / Math.pow((1 + (this.kappa * dfr)), this.beta));
	}
}

class PowerDiscount {
	constructor(beta) {
		this.beta = beta;
	}

	getValue(dfr) {
		return Math.pow(t, (this.beta * -1));
	}
}

class ConstantHorizonDiscount{
	constructor(horizon) {
		this.horizon = horizon;
	}

	getValue(dfr) {  //can perhaps add another discount parameter here
		if (dfr < this.horizon) {
			return 1;
		} else return 0;
	}
}

class CustomDiscount extends Discount{
	constructor(vector) {
		this.discount_vector = vector;
	}

	getValue(dfr) {
		return this.discount_vector[dfr];
	}
}

//Note: We use fixed lifetime for all discounts anyway, but with d_t = [[t < m]] = gamma ^t if t < m
