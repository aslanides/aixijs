QUnit.test("Grids",function(assert) {
	env = new SimpleDispenserGrid(environments.dispenser1)
	assert.equal(env.pos.x,0)
	assert.equal(env.pos.y,0)
	var e = env.generatePercept()
	assert.ok(env.conditionalDistribution(e) > 0,"Bad news")
	var plan = [3,3,1,1,1,1,1,3,3,1,3]
	for (var a of plan) {
		env.do(a)
		e = env.generatePercept()
		assert.equal(e.rew,rewards.move)
		assert.ok(env.conditionalDistribution(e) > 0)

	}
	env.do(3)
	e = env.generatePercept()
	assert.equal(e.rew,rewards.chocolate + rewards.move)
	assert.ok(env.conditionalDistribution(e) > 0)
})
