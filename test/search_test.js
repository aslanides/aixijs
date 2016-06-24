QUnit.test("Search",function(assert) {
    var options = new Options()
    options.model_class = SimpleDispenserGrid.modelClass(SimpleDispenserGrid,Test.config())
    options.mu = 5
    options.num_actions = 5
    options.prior_type = "Informed"

    // given an informed bayesian agent with an empty decision tree
    var tree = new RLDecisionNode()
    agent = new BayesAgent(options)

    agent.model.save()
    // when we sample once
    tree.sample(agent,0)
    // then we visit the root once, and generate no successors
    agent.model.load()
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
    var p = Test.do(agent.model,4)
    // the model should be in the initial state
    assert.deepEqual(agent.model.get(options.mu).pos,Test.config().initial_pos)
    // the agent's selectAction routine should do this as well
    var a = agent.selectAction(p.obs)
    assert.equal(a,1)
})

QUnit.test("Search2",function(assert) {
    var cfg = Util.deepCopy(environments.dispenser2)
    cfg.initial_pos = {x:4,y:1}

    var options = new Options()
    options.model_class = SimpleDispenserGrid.modelClass(SimpleDispenserGrid,cfg)
    options.mu = 22
    options.num_actions = 5
    options.prior_type = "Informed"

    var agent = new BayesAgent(options)
    agent.model.save()
    for (var i = 0; i < 5000; i++) {
        agent.search_tree.sample(agent,0)
        agent.model.load()
    }
    for (var i =0; i < 5; i++) {
        var p = Test.do(agent.model,2)
        agent.model.load()
    }
    assert.equal(agent.search_tree.bestAction(agent),2)
})

QUnit.test("Search2.5",function(assert) {
    // given an informed agent
    var options = new Options()
    options.model_class = SimpleDispenserGrid.modelClass(SimpleDispenserGrid,environments.dispenser2)
    options.mu = 22
    options.num_actions = 5
    options.prior_type = "Informed"
    var agent = new BayesAgent(options)

    // when we mutate its model so that it's at the chocolate
    var percept
    for (var i = 0; i < 4; i++) {
        percept = Test.do(agent.model,1)
        assert.equal(percept.rew,rewards.empty)
    }

    percept = Test.do(agent.model,2)
    assert.equal(percept.rew,rewards.empty)
    percept = Test.do(agent.model,2)

    // then its model predicts that it gets chocolate
    assert.equal(percept.rew,rewards.chocolate)
    assert.deepEqual(agent.model.model_class[22].pos,{x:4,y:2})

    // now if we query the agent, it should want to stay still
    var a = agent.selectAction(percept.obs)
    assert.equal(a,4)
    agent.model.save()
    for (var i = 0; i < 500; i++) {
        agent.search_tree.sample(agent,0)
        agent.model.load()
    }
    for (var i =0; i < 10; i++) {
        var a = agent.search_tree.bestAction(agent)
        assert.equal(a,4)
    }
})

QUnit.test("Search3",function(assert) {
    var N = 10
    for (var i =0; i < N; i++) {
        var options = new Options()
        options.model_class = SimpleDispenserGrid.modelClass(SimpleDispenserGrid,environments.dispenser2)
        options.mu = 22
        options.num_actions = 5
        options.prior_type = "Informed"
        var ag = new BayesAgent(options)
        var p = Test.do(ag.model,4)
        for (var t=0;t<6;t++) {
            var a = ag.selectAction(p.obs)
            p = Test.do(ag.model,a)
        }
        assert.equal(p.rew,rewards.chocolate)
    }
})
