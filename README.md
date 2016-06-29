# AIXIjs
General Reinforcement Learning (RL) Demo for demonstrating asymptotic optimality and other behaviors/properties of RL agents in general (partially observable, non-Markov, non-ergodic) environments. **Work in progress** -- expected completion ~ September 2016.
## Usage
This software consists of a bunch of different `demo` classes, each of which, when run, will simulate some user-specified number of cycles of agent-environment interaction for some agent/environment pair, with user-specified agent params.

The agents implemented are:
- Bayes (AIXI)
- KSA (Square, Shannon, and Kullback-Leibler)
- MDL
- Optimistic AIXI
- Thompson Sampling
- (Tabular) QLearning/SARSA

See the [main site](http://aslanides.github.io/aixijs) for more details, documentation, and demos.

Note: this is built using features from ECMAScript 2015 (ES6). For this reason, we highly recommend running on Google Chrome, since we're not supporting other browsers.

## License
GPL.

## TODO
- **Visualization**
	- Make button to toggle policy arrows/Bayes posterior
	- Show last action taken by agent in grid worlds
	- Implement Basic MDP visualization (fully specified by states, transition probabilities, and rewards)
- **UI**
    - Add progress bar for long simulations
    - Make play/pause a toggle button
	- Add option for user to play environment
	- Add visualization/plot legend
- **Demos**
    - Implement all the showcase environments/demos!
	- Implement a dispenser environment with a local maximum
- See github issues for major TODOs.
