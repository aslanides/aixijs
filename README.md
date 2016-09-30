# AIXIjs
AIXIjs is a JavaScript demo for running General Reinforcement Learning (RL) agents in the browser. In particular, it provides a general and extensible framework for running experiments on Bayesian RL agents in general (partially observable, non-Markov, non-ergodic) environments.

## Features
Agents implemented so far:
- Bayes (AIXI)
- KSA (Square, Shannon, and Kullback-Leibler)
- Thompson Sampling
- (Tabular) QLearning/SARSA

Environments implemented:
- Bandit
- FSMDP
- Gridworld

See the [main site](http://aslanides.github.io/aixijs) for more background, documentation, references, and demos.

Note: AIXIjs uses some features from ECMAScript 2015 (ES6). It *should* work on recent versions of Firefox, Safari, Edge, and Chrome, but it's only really been tested on Chrome, so that's what I recommend using.

## API
There are a number of demos pre-made and ready to go; look at `src/demo.js` for examples. If you want to roll your own demo, here's an example of how to get a basic simulation working, with AIXI on a Dispenser Gridworld:

```javascript
let config = { /* ... */ }; // environment config; see src/config.js for examples
let env = new Gridworld(config); // construct environment
let options = new Options(); // defaults to sensible values, but we can change them
options.getEnvParams(env); // get things like num actions, etc from environment
options.cycles = 200; // run simulation for 200 cycles
let agent = new BayesAgent(options); // construct agent
let trace = new BayesTrace(); // accumulator for performance and history

let a = null; // action
let e = env.generatePercept() // percept

// main loop
for (let t = 0; t < options.cycles; t++) {
	trace.log(agent, env, a, e); // log info to trace
	a = agent.selectAction(e); // agent computes its policy and selects an action
	env.perform(a); // pass this action to the environment and compute dynamics
	e = env.generatePercept(); // environment emits a percept
	agent.update(a, e); // agent learns from action and resulting percept
}
// now do what you want with the trace -- it has logged all the relevant data
//
```

Note that agents should implement two methods, `selectAction(e)` and `update(a,e)`. Environments should implement `generatePercept()`, `perform(a)`, and `conditionalDistribution(e)`.

## License
GPL.

## TODO
- **Visualization**
	- Make button to toggle policy arrows/Bayes posterior
	- Show last action taken by agent in grid worlds
- **UI**
    - Make play/pause a toggle button
	- Add option for user to play environment
- **Demos**
    - Implement all the showcase environments/demos!
- See github issues for major TODOs.
