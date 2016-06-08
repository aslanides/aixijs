QUnit.test("SimpleDispenserGrid",function(assert) {
	var cfg = Test.config()
	cfg.freqs=[1]
	cfg.dispenser_pos = {x:2,y:1}
	var e = new SimpleDispenserGrid(cfg)

    // dispenser stuff
    assert.equal(e.grid.disp[0][0],2)
    assert.equal(e.grid.disp.length,1)

    // rewards and dynamics
    e.pos = {x:1,y:1}
    var percept = Test.do(e,0) // up
    assert.equal(percept.rew,rewards.wall)
    percept = Test.do(e,1) // down
    assert.equal(percept.rew,rewards.chocolate)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,rewards.chocolate)
    percept = Test.do(e,1) // down
    assert.equal(percept.rew,rewards.wall)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,rewards.chocolate)
    percept = Test.do(e,2)
    assert.equal(percept.rew,rewards.wall)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,rewards.chocolate)

    // save and load
    e.save()
    percept = Test.do(e,0)
    assert.equal(percept.rew,rewards.empty)
    percept = Test.do(e,4)
    assert.equal(percept.rew,rewards.empty)
    e.load()
    percept = Test.do(e,4)
    assert.equal(percept.rew,rewards.chocolate)
    assert.equal(e.pos.x,2)
})

QUnit.test("conditionalDistribution",function(assert) {
    var cfg = Test.config()
    cfg.dispenser_pos = {x:2,y:1}
    var env = new SimpleDispenserGrid(cfg)
    var actions = [0,1,2,3,4]
    for (var i=0; i<1e3; i++) {
        var a = Util.randomChoice(actions)
        env.do(a)
        var percept = env.generatePercept()
        var n = env.conditionalDistribution(percept)
        assert.notEqual(n,0)
    }
})
