import * as util from './util';
import {DiscountFn} from '../types';

export function NoDiscount(): DiscountFn {
  return (_: number) => 1;
}

export function GeometricDiscount(gamma: number): DiscountFn {
  return (dfr: number) => Math.pow(gamma, dfr);
}

export function HyperbolicDiscount(params: {
  beta: number;
  kappa: number;
}): DiscountFn {
  const beta = params.beta;
  const kappa = params.kappa;
  return (dfr: number) => Math.pow(1 + kappa * dfr, -beta);
}

export function PowerDiscount(beta: number): DiscountFn {
  return (dfr: number, t?: number) => Math.pow(dfr + (t || 0), -beta);
}

export function ConstantHorizonDiscount(horizon: number): DiscountFn {
  return (dfr: number) => (dfr < horizon ? 1 : 0);
}

export function CustomDiscount(discounts: number[]): DiscountFn {
  return (dfr: number) => discounts[dfr];
}

export function MatrixDiscount(params: {
  discounts: Array<(x: number) => number>;
  discountChanges: number[];
}): DiscountFn {
  const discounts = util.arrayCopy(params.discounts);
  const times = util.arrayCopy(params.discountChanges);
  let idx = 0;
  let current = discounts[idx];
  idx++;

  return (dfr: number, t?: number) => {
    if ((t || 0) === times[idx]) {
      current = discounts[idx];
      idx++;
    }

    return current(dfr);
  };
}
