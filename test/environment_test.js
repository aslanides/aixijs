QUnit.test("SimpleDispenserGrid",function(assert) {
    var e = new SimpleDispenserGrid(Test.config())

    // dispenser stuff
    e.grid.addDispenser(2,1,1)
    assert.equal(e.grid.disp[0][0],2)
    assert.equal(e.grid.disp.length,1)

    // rewards and dynamics
    e.pos = {x:1,y:1}
    var percept = Test.do(e,0) // up
    assert.equal(percept.rew,r_wall)
    percept = Test.do(e,1) // down
    assert.equal(percept.rew,r_chocolate)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,r_chocolate)
    percept = Test.do(e,1) // down
    assert.equal(percept.rew,r_wall)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,r_chocolate)
    percept = Test.do(e,2)
    assert.equal(percept.rew,r_wall)
    percept = Test.do(e,4) // noop
    assert.equal(percept.rew,r_chocolate)

    // save and load
    e.save()
    percept = Test.do(e,0)
    assert.equal(percept.rew,r_empty)
    percept = Test.do(e,4)
    assert.equal(percept.rew,r_empty)
    e.load()
    percept = Test.do(e,4)
    assert.equal(percept.rew,r_chocolate)
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
