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
	constructor(params) {
		this.gamma = params.gamma;
	}

	getValue(dfr) {
		return Math.pow(this.gamma, dfr);
	}
}

class HyperbolicDiscount {
	constructor(params) {
		this.kappa = params.kappa;
		this.beta = params.beta;
	}

	getValue(dfr) {
		return (1 / Math.pow((1 + (this.kappa * dfr)), this.beta));
	}
}

class PowerDiscount {
	constructor(params) {
		this.beta = params.beta;
	}

	getValue(dfr, t) {
		return Math.pow(t, (this.beta * -1));
	}
}

class ConstantHorizonDiscount{
	constructor(params) {
		this.horizon = params.horizon;
	}

	getValue(dfr) {  //can perhaps add another discount parameter here
		if (dfr < this.horizon) {
			return 1;
		} else return 0;
	}
}

class CustomDiscount extends Discount{
	constructor(params) {
		this.discount_vector = params.vector;
	}

	getValue(dfr) {
		return this.discount_vector[dfr];
	}
}

//Note: We use fixed lifetime for all discounts anyway, but with d_t = [[t < m]] = gamma ^t if t < m
