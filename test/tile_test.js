QUnit.test("Dispenser",function(assert) {
    var t = new Dispenser(0,0,1)
    assert.notOk(t.chocolate)
    for (var i=0; i<100;i++) {
        assert.equal(t.reward(),r_empty)
        t.dispense()
        assert.ok(t.chocolate)
        assert.equal(t.reward(),r_chocolate)
        assert.notOk(t.chocolate)
    }
})

QUnit.test("Grid",function(assert) {
    var g = new Grid(Test.config())
    g.addDispenser(0,0,0.3)
    assert.equal(g.getDispenser().chocolate,false)
    assert.equal(g.getDispenser().freq,0.3)
    g.removeDispenser(0,0)
    assert.equal(g.getTile(0,0).reward(),r_empty)

})
