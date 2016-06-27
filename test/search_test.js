QUnit.test("Search",function(assert) {
    var mock_agent = {
		horizon: 3,
		UCBweight : 1,
		max_reward : rewards.chocolate + rewards.move,
		min_reward : rewards.wall + rewards.move,
		num_actions : 5,
		samples : 800,
		utility : e => e.rew,
		decision_node : RLDecisionNode
	}

	var model = new BayesMixture({
		model_class : Gridworld.modelClass(SimpleDispenserGrid,environments.dispenser2),
		prior_type : "Informed",
		mu : 1
	})
	model.save()
	var tree = new ExpectimaxTree(mock_agent,model)
	for (var i = 0; i < 10; i++) {
		assert.equal(tree.bestAction(),3)
	}
})

QUnit.test("Search",function(assert) {
    var mock_agent = {
		horizon: 5,
		UCBweight : 1,
		max_reward : rewards.chocolate + rewards.move,
		min_reward : rewards.wall + rewards.move,
		num_actions : 5,
		samples : 400,
		utility : e => e.rew,
		decision_node : RLDecisionNode
	}

	var model = new BayesMixture({
		model_class : Gridworld.modelClass(SimpleDispenserGrid,environments.dispenser2),
		prior_type : "Informed",
		mu : 1
	})
	var tree = new ExpectimaxTree(mock_agent,model)
	for (var i = 0; i < 10; i++) {
		assert.equal(tree.bestAction(),3)
	}

	var rho = model.model_class[5]
	var tree2 = new ExpectimaxTree(mock_agent,rho)
	for (var i = 0; i < 10; i++) {
		assert.equal(tree2.bestAction(),1)
	}

	var rho2 = model.model_class[10]
	var tree3 = new ExpectimaxTree(mock_agent,rho2)
	for (var i = 0; i < 10; i++) {
		assert.equal(tree3.bestAction(),1)
	}

})
