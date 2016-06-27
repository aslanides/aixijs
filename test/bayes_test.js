QUnit.test("BayesMixtureUpdates",function(assert) {
    // given an informed bayes mixture
    var cfg = test.dispenser
    var M = Gridworld.modelClass(SimpleDispenserGrid,cfg)
    var truth = 5
    var model = new BayesMixture({model_class:M,prior_type:"Informed",mu:5})

    // and given corresponding ground truth environment
    cfg.goal_pos = {x:2,y:1}
    var env = new SimpleDispenserGrid(cfg)

    // then as we move around and update, our model should be consistent with
    // the environment
    model.save()
    var actions = [0,1,2,3,4]
    for (var i=0;i<1e2;i++) {
        var a = Util.randomChoice(actions)
        var or = Test.do(env,a)
        try {
            model.update(a,or)
            assert.deepEqual(env.pos,model.model_class[truth].pos)
        } catch(e) {
            console.error(e)
            assert.ok(false)
            break
        }
    }

    // when we load the saved model
    model.load()

    // then we should retrieve the original model state
    for (var i = 0; i < model.C; i++) {
        assert.deepEqual(model.model_class[i].pos.x,0)
		assert.deepEqual(model.model_class[i].pos.y,0)
    }

    // final sanity checks: normalization, etc
    assert.equal(model.weights[truth],1)
    assert.equal(Util.sum(model.weights),1)
})

QUnit.test("BayesMixtureSamples",function(assert) {
    var options = {
        model_class : Gridworld.modelClass(SimpleDispenserGrid,test.dispenser),
        mu : 5,
        num_actions : 5,
        prior_type : "Informed"
    }
    var model  = new BayesMixture(options)
    var percept
    assert.equal(model.weights[options.mu],1)
    for (var i = 0;i < 100; i++) {
        percept = Test.do(model,4) // noop
        assert.equal(percept.rew,rewards.move)
    }
    var percept = Test.do(model,1) // right
    assert.equal(percept.rew,rewards.move)
	var percept = Test.do(model,3) // down
    assert.equal(percept.rew,rewards.move)
	var percept = Test.do(model,1) // right
    assert.equal(percept.rew,rewards.chocolate + rewards.move)
    for (var i = 0;i < 100; i++) {
        percept = Test.do(model,4) // noop
        assert.equal(percept.rew,rewards.chocolate + rewards.move)
    }
    assert.equal(model.xi(percept),1)
})
