const config = {
    map :   [["F","W"],
            ["F","F"],
            ["W","F"]],
    initial_pos : {
        x: 1,
        y: 1
    }
}

QUnit.test("Dispenser",function(assert) {
    var t = new Dispenser(0,0,1)
    assert.equal(t.chocolate,false)
    assert.equal(t.reward(),r_empty)
    t.dispense()
    assert.equal(t.chocolate,true)
    assert.equal(t.reward(),r_chocolate)
})

QUnit.test("Grid",function(assert) {
    var g = new Grid(config)
    g.add_dispenser(0,0,0.3)
    assert.equal(g.get_dispenser().chocolate,false)
    assert.equal(g.get_dispenser().freq,0.3)
    g.remove_dispenser(0,0)
    assert.equal(g.get_tile(0,0).reward(),r_empty)

})

QUnit.test("SimpleDispenserGrid",function(assert) {
    var e = new SimpleDispenserGrid(config)
    // dispenser stuff
    e.grid.add_dispenser(2,1,1)
    assert.equal(e.grid.disp[0][0],2)
    assert.equal(e.grid.disp.length,1)
    // rewards and dynamics
    var percept = e.perform(0) // up
    assert.equal(percept.rew,r_wall)
    percept = e.perform(1) // down
    assert.equal(percept.rew,r_chocolate)
    percept = e.perform(4) // noop
    assert.equal(percept.rew,r_chocolate)
    // save and load
    e.save()
    percept = e.perform(0)
    assert.equal(percept.rew,r_empty)
    percept = e.perform(4)
    assert.equal(percept.rew,r_empty)
    e.load()
    percept = e.perform(4)
    assert.equal(percept.rew,r_chocolate)
    assert.equal(e.pos.x,2)
})

QUnit.test("BayesMixture",function(assert) {
    var model = new BayesMixture()
    assert.ok(true)
})
