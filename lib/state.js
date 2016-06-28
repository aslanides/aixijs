class State {
    constructor(index) {
        this.index = index;
		this.actions = []; //each action will have a list of transition probabilities (state to transition = index in array)
    }
	static new(index){
		return new State(index)
	}
}
