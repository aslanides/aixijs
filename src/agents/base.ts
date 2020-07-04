import { Percept, Action } from '../types';

export interface Agent {
  /* TODO(aslanides): docstring. */

  // Selects actions given a percept.
  selectAction(e: Percept): Action;

  // Updates the agent given an action and the resulting percept.
  update(a: Action, e: Percept): void;

  // Info for logging/visualization.
  info(): object;
}
