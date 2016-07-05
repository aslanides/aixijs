QUnit.test("ThompsonAgent",function(assert) {
	var cl = SimpleDispenserGrid
	var cfg = config.environments.dispenser2

	var env = new cl(cfg)
	var options = new Options()
	options.getEnvParams(env)
	options.model_class = Gridworld.modelClass(cl,cfg)
	var agent = new ThompsonAgent(options)

	var e
	var a
	e = env.generatePercept()
	a = agent.selectAction(e)
	env.perform(a)
	e = env.generatePercept()
	agent.update(a,e)

	var x = env.pos.x
	var y = env.pos.y

	assert.equal(agent.rho.pos.x,x)
	assert.equal(agent.rho.pos.y,y)
	agent.model.model_class.forEach(m => {
		assert.equal(m.pos.x,x)
		assert.equal(m.pos.y,y)
	})
})
