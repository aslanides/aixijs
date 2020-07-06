import {Environment} from './environments/base';
import {Agent} from './agents/base';
import {Plot} from './plots/base';
import {Visualisation} from './visualisations/base';

// TODO(aslanides): WTF does everything break when these are attributes of Experiment?!
let CANCELLED = false;
let RUNNING = false;

export class Experiment {
  /* TODO(aslanides): docstring. */

  agent: Agent;
  environment: Environment;

  plots: Plot[] = [];
  visualisations: Visualisation[] = [];

  constructor(
    agent: Agent,
    environment: Environment,
    plots?: Plot[],
    visualisations?: Visualisation[]
  ) {
    this.agent = agent;
    this.environment = environment;
    if (plots) this.plots = plots;
    if (visualisations) this.visualisations = visualisations;
  }

  run(tMax: number) {
    // Some logic.
    if (RUNNING) return;
    CANCELLED = false;
    RUNNING = true;
    console.log('Experiment started.');

    // Logging.
    const results: object[] = [];
    let totalReturn = 0;
    let step = 0;

    for (const plot of this.plots) plot.clear();

    const agent = this.agent;
    const environment = this.environment;

    const simulate = () => {
      if (step > tMax || CANCELLED) return;

      // Agent-environment interaction.
      const e = environment.generatePercept();
      const a = agent.selectAction(e);
      environment.perform(a);
      agent.update(a, e);

      // Book-keeping.
      totalReturn += e.rew;
      const result = {step, return: totalReturn};
      results.push(result);
      step++;

      // Update plots / logging.
      for (const plot of this.plots) plot.update(results);
      for (const vis of this.visualisations) vis.update(agent, environment);

      // Queue up next iteration.
      setTimeout(simulate);
    };

    simulate();
  }

  stop(): void {
    if (!RUNNING) return;
    console.log('Experiment stopped.');
    CANCELLED = true;
    RUNNING = false;
  }
}
