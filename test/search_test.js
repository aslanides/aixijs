QUnit.test("Search",function(assert) {
    let mock_agent = {
		horizon: 3,
		UCBweight : 1,
		max_reward : config.rewards.chocolate + config.rewards.move,
		min_reward : config.rewards.wall + config.rewards.move,
		num_actions : 5,
		samples : 800,
		utility : e => e.rew,
	}

	let model = new BayesMixture({
		model_class : Gridworld.modelClass(SimpleDispenserGrid,config.environments.dispenser2),
		prior_type : "Informed",
		mu : 1
	})
	model.save()
	let tree = new ExpectimaxTree(mock_agent,model)
	for (let i = 0; i < 10; i++) {
		assert.equal(tree.bestAction(),3)
	}
})

QUnit.test("Search",function(assert) {
    let mock_agent = {
		horizon: 5,
		UCBweight : 1,
		max_reward : config.rewards.chocolate + config.rewards.move,
		min_reward : config.rewards.wall + config.rewards.move,
		num_actions : 5,
		samples : 400,
		utility : e => e.rew,
	}

	let model = new BayesMixture({
		model_class : Gridworld.modelClass(SimpleDispenserGrid,config.environments.dispenser2),
		prior_type : "Informed",
		mu : 1
	})
	let tree = new ExpectimaxTree(mock_agent,model)
	for (let i = 0; i < 10; i++) {
		assert.equal(tree.bestAction(),3)
	}

	let rho = model.model_class[5]
	let tree2 = new ExpectimaxTree(mock_agent,rho)
	for (let i = 0; i < 10; i++) {
		assert.equal(tree2.bestAction(),1)
	}

	let rho2 = model.model_class[10]
	let tree3 = new ExpectimaxTree(mock_agent,rho2)
	for (let i = 0; i < 10; i++) {
		assert.equal(tree3.bestAction(),1)
	}

})
