class SearchNode {
    constructor() {
        this.visits = 0
        this.mean = 0
        this.children = new Map()
    }
    get_child(key) {
        return this.children.get(key)
    }
}

class DecisionNode extends SearchNode {
    constructor(percept) {
        super()
        this.percept = percept
    }
    add_child(child) {
        this.children.set(child.action,child)
    }
    select_action(agent) {
        var a
        if (this.children.size != agent.num_actions) {
            U = []
            for (var action = 0; action < num_actions; action++) {
                if (this.children.get(action) == undefined) {
                    U.push(action)
                }
            }
            a = random_choice(U)
        } else {
            max_value = Number.NEGATIVE_INFINITY
            for (var action = 0; action < agent.num_actions; action++) {
                child = this.get_child(action)
                normalization = agent.horizon * (agent.max_reward - agent.min_reward)
                vha = child.mean
                value = vha / normalization + agent.UCBweight * Math.sqrt(Math.log2(this.visits/child.visits))
                if (value > max_value) {
                    max_value = value
                    a = action
                }
            }
        }
        return a
    }
    sample(agent,dfr) {
        var reward = 0
        if (dfr == agent.horizon) {
            return 0
        } else if (this.visits == 0) {
            reward = playout(agent,agent.horizon - dfr)
        } else {
            action = this.select_action(agent)
            // agent.modelUpdate(action) TODO ??
            reward = this.get_child(action).sample(agent,dfr)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
    best_action(agent) {
        ties = []
        max_value = Number.NEGATIVE_INFINITY
        for (var action = 0; action < agent.num_actions) {
            if (this.get_child(action) == undefined) {
                value = 0
            } else {
                value = this.get_child.mean
            }
            if (value < max_value) {
                continue
            } else if (value > max_value) {
                ties = [action]
                max_value = value
            } else {
                ties.push(action)
            }
        }
        return random_choice(ties)
    }
}

class ChanceNode extends SearchNode {
    constructor(action) {
        super()
        this.action = action
    }
    add_child(child) {
        this.children.set(child.percept.obs + child.percept.rew,child)
    }
    get_child(percept) {
        this.children.get(percept.obs + percept.rew) // string
    }
    sample(agent,dfr) {
        var reward = 0
        if (dfr == agent.horizon) {
            return 0
        } else {
            percept = agent.model.sample(this.action)
            if (this.get_child(percept) == undefined) {
                decision_node = new DecisionNode(percept)
                this.add_child(decision_node)
            }
            reward = percept.rew + this.get_child(percept).sample(agent,dfr+1)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
}
