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

## License
GPL.

## TODO
- **Agents**
    - Implement KullbackLeiblerKSA
    - Implement MDL, OptimisticAIXI, ThompsonAgent
    - Add support for scheduling for epsilon-greedy agents
    - MCTS performance optimisations!
    - Implement general discounting in MCTS
- **Visualization**
    - Add optimal reward to d3 plots
    - Make arrow updates more efficient
    - Fix arrow updates at t = 0
    - Display Q-value overlay on visualization
	- Make VisTile / VisGrid that inherit from Tile/Grid
	- Remove magic numbers
	- Make button to toggle policy arrows
- **Plots**
	- Add 'landmarks' with descriptive text for user to jump to interesting events
	- Mouse cursor tooltip
- **UI**
    - Use default agent/cycle params for demos (involves large refactor to Demo/Options class)
    - Add progress bar for long simulations
    - Figure out how to get MarkDown/LaTeX working in index.html
    - Make play/pause a toggle button
	- Options to look at different plots
- **Demos**
    - Give default demo params in DOM
	- In Demo.simulate(), make agent internals logging more abstract
    - Implement all the showcase environments/demos!
- **Misc**
    - Refactor things
    - Fix up Search unit tests!
- **Reports**
	- Make a UML for Sean's semester report
