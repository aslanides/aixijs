QUnit.test("Grids",function(assert) {
	let env = new SimpleDispenserGrid(config.environments.dispenser1)
	assert.equal(env.pos.x,0)
	assert.equal(env.pos.y,0)
	let e = env.generatePercept()
	assert.ok(env.conditionalDistribution(e) > 0,"Bad news")
	let plan = [3,3,1,1,1,1,1,3,3,1,3]
	for (let a of plan) {
		env.perform(a)
		e = env.generatePercept()
		assert.equal(e.rew,config.rewards.move)
		assert.ok(env.conditionalDistribution(e) > 0)

	}
	env.perform(3)
	e = env.generatePercept()
	assert.equal(e.rew,config.rewards.chocolate + config.rewards.move)
	assert.ok(env.conditionalDistribution(e) > 0)
})
