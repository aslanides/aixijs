class State {
    constructor(index, reward) {
        this.index = index;
		this.actions = []; //each action will have a list of transition probabilities (state to transition = index in array)
		this.reward = reward;
    }
