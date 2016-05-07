QUnit.test("Search",function(assert) {
    var options = {
        model_class : Options.makeModels(SimpleDispenserGrid,Test.config()),
        midx : 5,
        num_actions : 5,
        prior_type : "Informed"
    }

    // given an informed bayesian agent with an empty decision tree
    var tree = new DecisionNode()
    var agent = new BayesAgent(options)

    agent.model.save()
    // when we sample once
    tree.sample(agent,0)
    // then we visit the root once, and generate no successors
    assert.equal(tree.visits,1)
    assert.equal(tree.children.size,0)
    // now, when we sample the root again
    tree.sample(agent,0)
    // there will be one successor
    assert.equal(tree.children.size,1)
    agent.model.load()

    // now, when we run MCTS for a while
    for (var i = 0; i < 5000; i++) {
        tree.sample(agent,0)
        agent.model.load()
    }
    // then the best action is to go down
    assert.equal(tree.bestAction(agent),1)
    // and, if the agent sits still and retrieves a percept from its model
    var p = agent.model.sample(4)
    // the agent's selectAction routine should do this as well
    var a = agent.selectAction(p.obs)
    assert.equal(a,1)
})

QUnit.test("Search2",function(assert) {
    var cfg = Util.deepCopy(environments.dispenser2)
    cfg.initial_pos = {x:4,y:1}
    var options = {
        model_class : Options.makeModels(SimpleDispenserGrid,cfg),
        midx : 22,
        num_actions : 5,
        prior_type : "Informed"
    }
    agent = new BayesAgent(options)
    agent.model.save()
    for (var i = 0; i < 5000; i++) {
        agent.search_tree.sample(agent,0)
        agent.model.load()
    }
    for (var i =0; i < 5; i++) {
        var p = agent.model.sample(2)
        agent.model.load()
    }
    assert.equal(agent.search_tree.bestAction(agent),2)
})

QUnit.test("Search3",function(assert) {
    var options = {
        model_class : Options.makeModels(SimpleDispenserGrid,environments.dispenser2),
        midx : 22,
        num_actions : 5,
        prior_type : "Informed"
    }
    env = new SimpleDispenserGrid(environments.dispenser2)
    agent = new BayesAgent(options)

    var o = env.initial_percept.obs
    var r = env.initial_percept.rew
    for (var i = 0; i < 6; i++) {
        console.log(env.pos)
        console.log(agent.model.model_class[22].pos)

        var a = agent.selectAction(o)
        console.log("---")
        if (a != 1 && a != 2) {
            assert.ok(false)
            break
        }
        env.do(a)
        var percept = env.generatePercept()
        var o_ = percept.obs
        r = percept.rew
        agent.update(o,a,r,o)
        if (env.pos.y > 3) {
            assert.ok(false,"fuck")
            console.log(env.pos)
            console.log(environments.dispenser2.dispenser_pos)
            console.log
            break
        }
        o = o_
    }
    assert.ok(true)
})
