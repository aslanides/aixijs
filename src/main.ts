import * as gridworld from './environments/gridworld';
import { RandomAgent } from './agents/random';
import { Experiment } from './experiment'
import { GridVisualisation } from './visualisations/gridvis';
import { ReturnPlot } from './plots/returns';
import { BayesAgent } from './agents/bayes';
import { env } from 'process';
import { NoDiscount } from './utils/discount';
import { Percept } from './types';


interface Options {
  [key: string]: unknown,
}

const environmentOptions = {
  statePercepts: true,
  size: 10,
  goals: [{ freq: 0.5 }],
};

const experimentOptions = {
  numSteps: 3000,
}

const agentOptions = {
  alpha: 0.1,
  gamma: 0.99,
  epsilon: 0.05,
  initialQ: 1,
}

let experiment: Experiment;

function newExperiment(): Experiment {
  const environment = gridworld.generateRandom(environmentOptions);
  // const agent = new RandomAgent(environment.numActions);
  // const agent = new QLearning(environment.numActions, agentOptions) // NOT WORKING
  const model = gridworld.makeModel(environment, 'foo')

  const options = {
    horizon: 6,
    samples: 100,
    ucb: 1,
    
    maxReward: environment.maxReward,
    minReward: environment.minReward,
    numActions: environment.numActions,
  }

  const agent = new BayesAgent(options, model, (e: Percept) => e.rew, NoDiscount())

  const plot = new ReturnPlot();
  const visualisation = new GridVisualisation(environment as gridworld.Gridworld);

  const experiment = new Experiment(agent, environment, [plot], [visualisation]);

  return experiment
}

experiment = newExperiment();

makeButtons();

makeUIOptions(experimentOptions, 'Experiment Options')
makeUIOptions(environmentOptions, 'Environment Options')
makeUIOptions(agentOptions, 'Agent Options')

function makeButtons() {
  /** TODO(aslanides): docstring. */
  
  // Run button.
  const runButton = document.getElementById('run') as HTMLButtonElement;
  runButton.onclick = () => experiment.run(experimentOptions.numSteps);

  // Stop button.
  const stopButton = document.getElementById('stop') as HTMLButtonElement;
  stopButton.onclick = experiment.stop;
}


function makeUIOptions(options: Options, name: string) {
  /** TODO(aslanides): docstring. */

  const setupDiv = document.getElementById('setup') as HTMLDivElement;

  // Skip for empty objects.
  if (Object.keys(options).length === 0) return;

  // Make a new section.
  const section = document.createElement('div')
  section.id = name
  setupDiv.appendChild(section)

  // Make a new heading.
  const heading = document.createElement('h3')
  heading.innerText = name
  section.appendChild(heading)

  // Add inputs for fields.
  for (const [field, value] of Object.entries(options)) {
    const dataType = typeof(value)

    if (dataType !== 'number' && dataType !== 'boolean') {
      console.log(`Warning: not implemented for datatype: ${dataType}.`)
      continue;
    }

    // Add label.
    const label = document.createElement('label')
    label.innerHTML = `<b>${field}: </b>`
    section.appendChild(label)

    // Add input.
    const input = document.createElement('input')
    if (typeof(value) === 'boolean') {
      input.type = 'checkbox';
      input.checked = value;
    } else {
      input.type = dataType;  // number
      input.value = `${value}`;
    }
    input.name = field;
    input.required = true;
    input.addEventListener('change', (_: Event) => {
      // Whenever the user changes an option, we want to create a new experiment.
      // Update the options.
      options[field] = (dataType === 'number' ? +input.value : input.checked)
      console.log(options)

      // Create a new Experiment.
      experiment = newExperiment();

    })
    section.appendChild(input);
  }
}  
