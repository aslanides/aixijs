class ExpectimaxTree {
    constructor(agent,model) {
        this.model = model
        this.horizon = agent.horizon
        this.UCBweight = agent.UCBweight
        this.max_reward = agent.max_reward
        this.min_reward = agent.min_reward
        this.num_actions = agent.num_actions
        this.samples = agent.samples
        this.agent = agent
        this.root = new agent.decision_node()
    }
    bestAction() {
        this.model.save()
        for (var iter = 0; iter < this.samples; iter++) {
            this.root.sample(this,0)
            this.model.load()
        }
		return this.root.bestAction(this)
    }
    rollout(len) {
        var reward = 0
        for (var i = 0; i < len; i++) {
            var action = Math.floor(Math.random() * this.num_actions)
            this.model.do(action)
            var percept = this.model.generatePercept()
            reward += this.agent.utility(percept,this.horizon-len)
        }
        return reward
    }
}

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
    selectAction(tree) {
        var a
        if (this.children.size != tree.num_actions) {
            var U = []
            for (var action = 0; action < tree.num_actions; action++) {
                if (this.children.get(action) == undefined) {
                    U.push(action)
                }
            }
            a = Util.randomChoice(U)
            this.addChild(a)
        } else {
            var max_value = Number.NEGATIVE_INFINITY
            for (var action = 0; action < tree.num_actions; action++) {
                var child = this.getChild(action)
                var normalization = tree.horizon * (tree.max_reward - tree.min_reward)
                var vha = child.mean
                var value = vha / normalization + tree.UCBweight * Math.sqrt(Math.log2(this.visits/child.visits))
                if (value > max_value) {
                    max_value = value
                    a = action
                }
            }
        }
        return a
    }
    sample(tree,dfr) {
        var reward = 0
        if (dfr > tree.horizon) {
            return 0
        } else if (this.visits == 0) {
            reward = tree.rollout(tree.horizon - dfr)
        } else {
            var action = this.selectAction(tree)
            reward = this.getChild(action).sample(tree,dfr)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
    bestAction(tree) {
        var ties = []
        var max_value = Number.NEGATIVE_INFINITY
        var value
        for (var action = 0; action < tree.num_actions; action++) {
            if (this.getChild(action) == undefined) {
                value = 0
            } else {
                value = this.getChild(action).mean
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
    addChild(percept) {
        throw "Not implemented"
    }
    sample(tree,dfr) {
        var reward = 0
        if (dfr > tree.horizon) {
            return reward
        } else {
            tree.model.do(this.action)
            var percept = tree.model.generatePercept()
            if (this.getChild(percept) == undefined) {
                this.addChild(percept)
            }
            reward = tree.agent.utility(percept) + this.getChild(percept).sample(tree,dfr+1)
        }
        this.mean = (1 / (this.visits + 1)) * (reward + this.visits * this.mean)
        this.visits++
        return reward
    }
}

class RLDecisionNode extends DecisionNode {
    constructor(percept) {
        super(percept)
    }
    addChild(a) {
        var child = new RLChanceNode(a)
        this.children.set(child.action,child)
    }
}

class UtilityDecisionNode extends DecisionNode {
    constructor(percept) {
        super(percept)
    }
    addChild(a) {
        var child = new UtilityChanceNode(a)
        this.children.set(child.action,child)
    }
}

class RLChanceNode extends ChanceNode {
    constructor(action) {
        super(action)
    }
    addChild(percept) {
        var child = new RLDecisionNode(percept)
        this.children.set(child.percept.obs + child.percept.rew,child)
    }
    getChild(percept) {
        return this.children.get(percept.obs + percept.rew)
    }
}

class UtilityChanceNode extends ChanceNode {
    constructor(action) {
        super(action)
    }
    addChild(percept) {
        var child = new UtilityDecisionNode(percept)
        this.children.set(child.percept,child)
    }
}
