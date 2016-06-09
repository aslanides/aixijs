# rl-demo
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

For more details, see the documentation/explanation that accompanies the demos themselves.

Note: this is built using features ECMAScript 2015, and so at the moment (May 2016) we don't support older browsers/Safari.

## License
GPL.

## TODO
- **Visualization**
    - Add optimal reward to d3 plots
    - Make arrow updates more efficient
	- Make button to toggle policy arrows/Bayes posterior
	- Show last action taken by agent in grid worlds
	- Implement Basic MDP visualization (fully specified by states, transition probabilities, and rewards)
- **UI**
    - Add progress bar for long simulations
    - Make play/pause a toggle button
	- Options to look at different plots
- **Demos**
    - Implement all the showcase environments/demos!
	- Implement a dispenser environment with a local maximum
- **Misc**
    - Fix up unit tests!
	- Add browser version check
	- Generalize model class setup.
- See github issues for major TODOs.
