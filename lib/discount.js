class Discount {
	constructor(){
	}
	eval(dfr){
		return undefined;
	}//dfr = t, where d_t is the discount given to the action t time steps ahead
}

class GeometricDiscount {//extends Discount{ //Includes no discount with gamma = 1
	constructor(gamma){
		this.gamma = gamma
	}
	eval(dfr){
		return Math.pow(this.gamma, dfr)
	}
}

class HyperbolicDiscount extends Discount{
	constructor(kappa, beta){
		this.kappa = kappa
		this.beta = beta
	}
	eval(dfr){
		return 	(1 / Math.pow((1 + (this.kappa * dfr)), this.beta))
	}
}

class PowerDiscount extends Discount{
	constructor(beta){
		this.beta = beta
	}
	eval(dfr){
		return Math.pow(t, (this.beta * -1))
	}
}

class ConstantHorizonDiscount{// extends Discount{
	constructor(horizon){
		this.horizon = horizon
	}
	eval(dfr){  //can perhaps add another discount parameter here
		if(dfr < this.horizon){
			return 1
		}
		else return 0
	}
}

class CustomDiscount extends Discount{
	constructor(vector){
		this.discount_vector = vector
	}

	eval(dfr){
		return this.discount_vector[dfr]
	}
}

//Note: We use fixed lifetime for all discounts anyway, but with d_t = [[t < m]] = gamma ^t if t < m
