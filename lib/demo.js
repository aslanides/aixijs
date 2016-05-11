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
        var o = env.initial_percept.obs
        var q = 0

        for (var iter = 0; iter < t; iter++) {
            trace.rewards.push(r_total)
            trace.positions.push(env.pos)
            trace.qs.push(q)

            // agent-environment interaction
            //
            var a = agent.selectAction(o)
            env.do(a)
            var percept = env.generatePercept()
            var o_ = percept.obs; var r = percept.rew;
            agent.update(o,a,r,o_)
            o = o_
            //

            q = agent.Q.get(o,a)
            r_total += r
        }
        return trace
    }
    static run() {
        if (demo) {
            demo.vis.pause()
        }
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

class QLearnDemo extends Demo {
    constructor() {
        var env = new SimpleEpisodicGrid(environments.episodic1)
        var options = new Options()
        options.getParams(document,env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
}

class QLearnDemo2 extends Demo {
    constructor() {
        var env = new SimpleDispenserGrid(environments.dispenser1)
        var options = new Options()
        options.getParams(document,env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
}

class AIMUDemo extends Demo {
    constructor() {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        var options = new Options()
        options.getParams(document,env)
        options.prior_type = "Informed"
        options.mu = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg)
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
}

class AIXIDemo extends Demo {
    constructor() {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        var options = new Options()
        options.getParams(document,env)
        options.prior_type = "Uniform"
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg)
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
}

class ThompsonDemo extends Demo {
    constructor() {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        var options = new Options()
        options.getParams(document,env)
        options.prior_type = "Uniform"
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg)
        var agent = new ThompsonAgent(options)
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
