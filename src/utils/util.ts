const clone = require('rfdc')();

// TODO(aslanides): Use Float32Array.
export function zeros(n: number): Float32Array {
  return new Float32Array(n);
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    message = message || 'Assertion failed';
    throw new Error(message);
  }
}

export function sum(arr: number[]): number {
  let s = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    s += arr[i];
  }

  return s;
}

export function prod(arr: number[]): number {
  let p = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    p *= arr[i];
  }

  return p;
}

export function deepCopy<T>(obj: T): T {
  return clone(obj);
}

export function arrayCopy<T>(arr: T[]): T[] {
  return clone(arr);
}

export function roundTo(x: number, figs: number) {
  // Rounds a number to a given # of significant figures.
  const tmp = Math.pow(10, figs);
  return Math.round(x * tmp) / tmp;
}

export function sample(weights: number[]): number {
  // Samples from a categorical distribution.
  const s = Math.random();
  let p = 0;
  for (let i = 0; i < weights.length; i++) {
    if (s <= p) {
      return i - 1;
    }

    p += weights[i];
  }

  return weights.length - 1;
}

export function KLDivergence(p: number[], q: number[]) {
  // Computes the KL divergence between two categorical distributions.
  assert(p.length === q.length, 'KL: p & q are different lengths');
  const n = p.length;
  const sp = sum(p);
  const sq = sum(q);
  let s = 0;
  for (let i = 0; i < n; i++) {
    // Avoid div by zero.
    if (p[i] === 0 || q[i] === 0) {
      continue;
    }

    s += (p[i] / sp) * Math.log2((p[i] * sq) / (q[i] * sp));
  }

  return s;
}

export function entropy(p: number[] | Float32Array): number {
  // Computes the entropy of a  categorical distribution.
  let s = 0;
  const n = p.length;
  for (let i = 0; i < n; i++) {
    if (p[i] === 0) {
      continue;
    }

    s -= p[i] * Math.log2(p[i]);
  }

  return s;
}

export function logProgress(t: number, T: number): void {
  const prog = ((t + 1) / T) * 100;
  if (prog % 10 === 0) {
    console.clear();
    console.log(`Progress: ${prog}%`);
  }
}

export function softMax(arr: number[], j: number) {
  let s = 0;
  arr.forEach(x => {
    s += Math.pow(Math.E, x);
  });
  return Math.pow(Math.E, j) / s;
}

export function randInts(n: number) {
  // TODO(aslanides): docstring.
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = i;
  }

  let max = n - 1;
  let r;
  let swap;
  while (max > 0) {
    r = Math.floor(Math.random() * max);
    swap = arr[r];
    arr[r] = arr[max];
    arr[max] = swap;
    max--;
  }

  return arr;
}

export function cumToInc(arr: number[]): number[] {
  // TODO(aslanides): docstring.
  const T = arr.length;
  const inc = new Array(T);
  inc[0] = 0;
  for (let i = 1; i < T; i++) {
    inc[i] = arr[i] - arr[i - 1];
  }

  return inc;
}

export function sigmoid(x: number): number {
  return 1.0 / (1 + Math.exp(-x));
}

export function encode(symlist: number[], value: number, bits: number) {
  let tmp = value;
  for (let i = 0; i < bits; i++, tmp /= 2) {
    symlist.push(tmp & 1);
  }
}

export function decode(symlist: number[], bits: number) {
  let value = 0;
  const n = symlist.length;
  for (let i = 0; i < bits; i++) {
    value = symlist[n - i - 1] + 2 * value;
  }

  return value;
}

export function I<T>(a: T, b: T): number {
  // Indicator fn
  return a === b ? 1 : 0;
}

export function gaussRandom(retval = false, val = 0): number {
  if (retval) {
    retval = false;
    return val;
  }

  const u = 2 * Math.random() - 1;
  const v = 2 * Math.random() - 1;
  const r = u * u + v * v;
  if (r === 0 || r > 1) return gaussRandom();
  const c = Math.sqrt((-2 * Math.log(r)) / r);
  val = v * c; // cache this
  retval = true;
  return u * c;
}

export function randi(a: number, b: number): number {
  // Random integer in range {a, ..., b}.
  a = Math.floor(a);
  b = Math.floor(b);
  return Math.floor(Math.random() * (b - a)) + a;
}

export function randf(a: number, b: number): number {
  // Random float in the range [a, b].
  return Math.random() * (b - a) + a;
}

export function randn(mu: number, std: number): number {
  // Random normal with given mean/std.
  return mu + gaussRandom() * std;
}

export function argmax<T>(
  obj: T,
  accessor: (o: T, i: number) => number,
  size: number
): number {
  /* Arg-max, breaking ties at random. */
  let max = Number.NEGATIVE_INFINITY;
  let ties: number[] = [];
  for (let a = 0; a < size; a++) {
    const val = accessor(obj, a);
    if (val < max) {
      continue;
    } else if (val > max) {
      ties = [a];
      max = val;
    } else {
      ties.push(a);
    }
  }

  return randomChoice(ties);
}

export function argsoftmax(arr: number[], beta = 2): number {
  let sumexp = 0;
  const vals = [];
  for (let a = 0; a < arr.length; a++) {
    const val = Math.exp(beta * arr[a]);
    vals.push(val);
    sumexp += val;
  }
  for (let a = 0; a < arr.length; a++) {
    vals[a] = vals[a] / sumexp;
  }
  const a = sample(vals);
  return a;
}
