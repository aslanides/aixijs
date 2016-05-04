class SearchNode {
    constructor() {
        this.visits = 0
        this.mean = 0
        this.children = new Map()
    }
    getChild(key) {
        return this.children.get(key)
    }
    toJson() {
        var name
        if (this.action != undefined) {
            name = "action: " + this.action
        } else if (this.percept != undefined) {
            name = "percept: " + this.percept.obs + this.percept.rew
        } else {
            name = "root"
        }
        var children = []
        function f(child,key) { children.push(child.toJson())}
        this.children.forEach(f)
        var res = {name : name}
        if (children.length > 0) {
            res.children = children
        }
        return res
    }
}

class DecisionNode extends SearchNode {
    constructor(percept) {
        super()
        this.percept = percept
    }
    addChild(child) {
        this.children.set(child.action,child)
    }
    selectAction(agent) {
        var a
        if (this.children.size != agent.num_actions) {
            var U = []
            for (var action = 0; action < agent.num_actions; action++) {
                if (this.children.get(action) == undefined) {
                    U.push(action)
                }
            }
            a = Util.randomChoice(U)
            this.addChild(new ChanceNode(a))
        } else {
            var max_value = Number.NEGATIVE_INFINITY
            for (var action = 0; action < agent.num_actions; action++) {
                var child = this.getChild(action)
                var normalization = agent.horizon * (agent.max_reward - agent.min_reward)
                var vha = child.mean
                var value = vha / normalization + agent.UCBweight * Math.sqrt(Math.log2(this.visits/child.visits))
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
            reward = Search.playout(agent,agent.horizon - dfr)
        } else {
            var action = this.selectAction(agent)
            reward = this.getChild(action).sample(agent,dfr)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
    bestAction(agent) {
        var ties = []
        var max_value = Number.NEGATIVE_INFINITY
        var value
        for (var action = 0; action < agent.num_actions; action++) {
            if (this.getChild(action) == undefined) {
                value = 0
            } else {
                value = this.getChild.mean
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
        return Util.randomChoice(ties)
    }
}

class ChanceNode extends SearchNode {
    constructor(action) {
        super()
        this.action = action
    }
    addChild(child) {
        this.children.set(child.percept.obs + child.percept.rew,child)
    }
    getChild(percept) {
        return this.children.get(percept.obs + percept.rew)
    }
    sample(agent,dfr) {
        var reward = 0
        if (dfr == agent.horizon) {
            return reward
        } else {
            var percept = agent.model.sample(this.action)
            if (this.getChild(percept) == undefined) {
                this.addChild(new DecisionNode(percept))
            }
            reward = percept.rew + this.getChild(percept).sample(agent,dfr+1)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
}

class Search {
    static playout(agent, playout_len) {
        var reward = 0
        for (var i = 0; i < playout_len; i++) {
            var action = Math.floor(Math.random() * agent.num_actions)
            reward += agent.model.sample(action).rew
        }
        return reward
    }
}
