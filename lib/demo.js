"use strict";
var demo

class Demo {
	constructor(env,agent,t) {
		this.agent = agent
		this.env = env
		this.t_max = t
	}
    simulate(env,agent,t) {
        var trace = new agent.tracer(t)
		var a
		var o = env.initial_percept.obs
		var r = env.initial_percept.rew
        for (var iter = 0; iter < t; iter++) {
			trace.log(agent,env,a,o,r)

            a = agent.selectAction(o)
            env.do(a)
            var e = env.generatePercept()
            o = e.obs
			r = e.rew
            agent.update(a,o,r)

			Util.logProgress(iter,t)
        }
        return trace
    }
    static run(doc) {
        if (demo && demo.vis) {
            demo.vis.pause()
        }

		var name = doc.getElementById("demo_select").value
		if (demos[name] == undefined) {
			console.error("Please select a demo to run.")
			return false
		}

		var options = new Options()
		var ok = options.getAgentParams(document)
		if (!ok) {
			console.error("Bad options.")
			return false
		}

        demo = new demos[name](options)
		demo.trace = demo.simulate(demo.env,demo.agent,demo.t_max)
		demo.vis = new demo.agent.vis(demo.env,demo.trace)

		doc.getElementById("navigation").style.display="block"

		return true
    }
    static init() {
		var x = document.getElementById("demo_select")
        for (var o in demos) {
            var option = document.createElement("option")
            option.text = demos[o].name
            x.add(option)
        }
    }
	static setOptions() {
		document.getElementById("p_cycles").style.display="table-row"
		demos[document.getElementById("demo_select").value].setOptions(document)
	}
}

class TabularDemo extends Demo {
	static setOptions(doc) {
		Options.setParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e5})
	}
}

class QLearnDemo extends TabularDemo {
    constructor(options) {
        var env = new SimpleEpisodicGrid(environments.episodic1)
        options.getEnvParams(env)
        var agent = new QLearn(options)
        super(env,agent,options.cycles)
    }
}

class QLearnDemo2 extends TabularDemo {
    constructor(options) {
        var env = new SimpleDispenserGrid(environments.dispenser1)
        options.getEnvParams(env)
        var agent = new QLearn(options)
        super(env,agent,options.cycles)
    }
}

class BayesDemo extends Demo {
	static setOptions(doc) {
		Options.setParams(doc,{horizon:6,samples:400,cycles:1e2})
	}
}

class AIMUDemo extends BayesDemo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Informed"
        options.mu = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
        options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.cycles)
    }
}

class AIXIDemo extends BayesDemo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.cycles)
    }
}

class AIMUDemo2 extends BayesDemo {
	constructor(options) {
        var cfg = environments.episodic1
		var cl = POEpisodicGrid
        var env = new cl(cfg)
        options.getEnvParams(env)
        options.prior_type = "Informed"
		options.mu = env.grid.N * cfg.chocolate_pos.x + cfg.chocolate_pos.y
        options.makeModels(cl,cfg,"chocolate_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.cycles)
    }
	static setOptions(doc) {
		Options.setParams(doc,{horizon:30,samples:2000,cycles:40})
	}
}

class AIXIDemo2 extends BayesDemo {
	constructor(options) {
        var cfg = environments.episodic1
		var cl = SimpleEpisodicGrid
        var env = new cl(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
		options.makeModels(cl,cfg,"chocolate_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.cycles)
    }
	static setOptions(doc) {
		Options.setParams(doc,{horizon:30,samples:1000,cycles:100})
	}
}

class AIXIDemo3 extends BayesDemo {
	constructor(options) {
        var cfg = environments.episodic2
		var cl = SimpleEpisodicGrid
        var env = new cl(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
		options.makeModels(cl,cfg,"chocolate_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.cycles)
    }
	static setOptions(doc) {
		Options.setParams(doc,{horizon:30,samples:1000,cycles:100})
	}
}

class ThompsonDemo extends Demo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new ThompsonAgent(options)
        super(env,agent,options.cycles)
    }
	static setOptions(doc) {
		Options.setParams(doc,{horizon:3,samples:500,cycles:500})
	}
}

class ThompsonDemo2 extends Demo {
    constructor(options) {
        var cfg = environments.dispenser2
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new ThompsonAgent(options)
        super(env,agent,options.cycles)
    }
	static setOptions(doc) {
		Options.setParams(doc,{horizon:3,samples:500,cycles:500})
	}
}

class HeavenHell extends Demo {

}

class SquareKSADemo extends BayesDemo {
	constructor(options) {
		var cfg = environments.episodic1
		var env = new POEpisodicGrid(cfg)
		options.getEnvParams(env)
		options.prior_type = "Uniform"
		options.makeModels(POEpisodicGrid,cfg,"chocolate_pos")
		var agent = new SquareKSA(options)
		super(env,agent,options.cycles)
	}
}

class ShannonNoise extends Demo {

}

// etc
