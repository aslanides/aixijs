// Percepts are tuples of (observation, reward).
export interface Percept {
  obs: Observation;
  rew: Reward;
}

// Actions are integers.
export type Action = Integer;
export type Observation = any;  // TODO(aslanides): nail this down.
export type Reward = Float;

// Primitive types (not enforced, of course, but for documentation).
export type Integer = number;
export type Float = number;

// Function types.

// A Utility function maps percepts to rewards.
export type UtilityFn = (e: Percept) => Reward;

// A discount function maps time to a scalar in [0, 1].
export type DiscountFn = (dfr: Integer, t?: Integer) => Float;
