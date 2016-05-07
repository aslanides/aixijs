var demo

class Demo {
    constructor(env,agent,t) {
        this.env = env
        this.agent = agent
        this.trace = this.simulate(this.env,this.agent,t)
        this.vis = new Visualization(this.env,this.trace)
    }
    simulate(env,agent,t) {
        var trace = new Trace()
        var r_total = env.initial_percept.rew
        var s = env.initial_percept.obs
        var q = 0
		var r_ave = 0
        for (var iter = 0; iter < t; iter++) {
            trace.rewards.push(r_total)
            trace.positions.push(env.pos)
            trace.qs.push(q)

            var a = agent.selectAction(s)
            env.do(a)
            var percept = env.generatePercept()
            var s_ = percept.obs
            var r = percept.rew
            agent.update(s,a,r,s_)
            q = agent.Q.get(s, a)
            s = s_
            r_total += r
        }
        return trace
    }
    static run() {
        document.getElementById("navigation").style.display="block"
        demo = new demos[document.getElementById("demo_select").value]()
    }
    static init() {
        for (var o in demos) {
            var x = document.getElementById("demo_select")
            var option = document.createElement("option")
            option.text = demos[o].name
            x.add(option)
        }
    }
}

class QLearnEpisodicDemo extends Demo {
    constructor() {
        var env = new SimpleEpisodicGrid(environments.episodic1)
        var options = new Options(document,env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
}

class QLearnDispenserDemo extends Demo {
    constructor() {
        var env = new SimpleDispenserGrid(environments.dispenser1)
        var options = new Options(document,env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
}

class BayesDispenserDemo extends Demo {
    constructor() {
        var env = new SimpleDispenserGrid(environments.dispenser2)
        var options = new Options(document,env)
        options.prior_type = "Informed"
        options.midx = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
        options.model_class = Options.makeModels(SimpleDispenserGrid,environments.dispenser2)
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
}

class HeavenHell extends Demo {

}

class SquareShannon extends Demo {

}

class ShannonNoise extends Demo {

}

// etc
