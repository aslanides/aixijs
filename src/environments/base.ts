import {Percept} from '../types';

export interface Environment {
  /* An interface for reinforcement learning environments. */

  // Methods for interacting with the environment.
  perform(action: number): void;
  generatePercept(): Percept;

  // Environments induce probability distributions on percepts conditioned on histories.
  conditionalDistribution(percept: Percept): number;

  // Saving/loading of environment state.
  save(): void;
  load(): void;

  // Info for logging/visualization.
  info(): object;

  // Action specification.
  numActions: number;
}
