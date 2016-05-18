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
            trace.a.push(a)
            if ((iter) % (t/ 50) == 0){
                trace.q_map.push(Util.deepMap(agent.Q))
            }

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

			var p_done = (iter+1)/t * 100
			if (p_done % 10 == 0) {
				console.log('Demo.simulate():' + p_done + "% done")
			}
        }
        return trace
    }
    static run() {
        if (demo) {
            demo.vis.pause()
        }
		var name = document.getElementById("demo_select").value
		if (demos[name] == undefined) {
			console.log("Please select a demo to run.")
			return false
		}
		var options = new Options()
		var ok = options.getAgentParams(document)
		if (!ok) {
			console.log("Bad options.")
			return false
		}

        demo = new demos[name](options)
		document.getElementById("navigation").style.display="block"

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
	static setup() {
		demos[document.getElementById("demo_select").value].ops(document)
	}
}

class QLearnDemo extends Demo {
    constructor(options) {
        var env = new SimpleEpisodicGrid(environments.episodic1)
        options.getEnvParams(env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(doc,0.9,0.99,0.01,1e5)
	}
}

class QLearnDemo2 extends Demo {
    constructor(options) {
        var env = new SimpleDispenserGrid(environments.dispenser1)
        options.getEnvParams(env)
        var agent = new QLearn(options)
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(doc,0.9,0.99,0.01,1e5)
	}
}

class AIMUDemo extends Demo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Informed"
        options.mu = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(doc,0.9,0.99,0.01,1e2)
	}
}

class AIXIDemo extends Demo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(doc,0.9,0.99,0.01,1e2)
	}
}

class AIXIDemo2 extends Demo {
	constructor(options) {
        var cfg = environments.episodic1
        var env = new POEpisodicGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.model_class = Options.makeModels(POEpisodicGrid,cfg,"chocolate_pos")
        var agent = new BayesAgent(options)
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(document,0.9,0.99,0.01,1e2)
	}
}

class ThompsonDemo extends Demo {
    constructor(options) {
        var cfg = environments.dispenser1
        var env = new SimpleDispenserGrid(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.model_class = Options.makeModels(SimpleDispenserGrid,cfg,"dispenser_pos")
        var agent = new ThompsonAgent(options)
		agent.horizion = 15
        super(env,agent,options.t_max)
    }
	static ops(doc) {
		Options.setParams(doc,0.9,0.99,0.01,1e2)
	}
}

class HeavenHell extends Demo {

}

class SquareShannon extends Demo {

}

class ShannonNoise extends Demo {

}

// etc
