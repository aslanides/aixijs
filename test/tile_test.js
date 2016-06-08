QUnit.test("Dispenser",function(assert) {
    var t = new Dispenser(0,0,1)
    assert.notOk(t.chocolate)
    for (var i=0; i<100;i++) {
        assert.equal(t.reward(),rewards.empty)
        t.dispense()
        assert.ok(t.chocolate)
        assert.equal(t.reward(),rewards.chocolate)
        assert.notOk(t.chocolate)
    }
})
