"use strict";
var demo

class Demo {
	constructor(env,agent,vis,t) {
		this.agent = agent
		this.env = env
        this.trace = new agent.tracer(t)
		var a
		var e = env.initial_percept
        for (var iter = 0; iter < t; iter++) {
			this.trace.log(agent,env,a,e)

            a = agent.selectAction(e)
            env.do(a)
            e = env.generatePercept()
            agent.update(a,e)

			Util.logProgress(iter,t)
        }
		this.vis = new vis(this.env,this.trace)
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

		doc.getElementById("navigation").style.display="none"
        demo = new demos[name](options)
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

class QLearnDemo extends Demo {
	constructor(options,cl,vis,cfg) {
		var env = new cl(cfg)
		options.getEnvParams(env)
		var agent = new QLearn(options)
		super(env,agent,vis,options.cycles)
	}
	static setOptions(doc) {
		Options.toggleExplanation(doc,"qlearn")
		Options.setParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e5})
	}
}

	class QLearnEpisodicDemo extends QLearnDemo {
	    constructor(options) {
			super(options,SimpleEpisodicGrid,TabularGridVis,environments.episodic1)
	    }
	}

	class QLearnDispenserDemo extends QLearnDemo {
	    constructor(options) {
	        super(options,SimpleDispenserGrid,TabularGridVis,environments.dispenser1)
	    }
	}

	class QLearnBanditDemo extends QLearnDemo {
		constructor(options) {
			var dists = []
			for (var i = 0; i < 2; i++) {
				dists.push(new NormalDistribution(10 * Math.random(),20 * Math.random() + 1))
			}
			super(options,Bandit,GaussianBanditVis,dists)
		}
		static setOptions(doc) {
			super.setOptions(doc)
			Options.setParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e3})
		}
	}

class BayesDemo extends Demo {
	static setOptions(doc) {
		Options.setParams(doc,{horizon:6,samples:400,cycles:1e2})
	}
}

	class AIMUDemo extends BayesDemo {
		constructor(options,cl,cfg) {
			var env = new cl(cfg)
	        options.getEnvParams(env)
	        options.prior_type = "Informed"
			options.mu = env.N * cfg.goal_pos.x + cfg.goal_pos.y
			options.model_class = env.modelClass(cfg)
	        var agent = new BayesAgent(options)
	        super(env,agent,AIXIVis,options.cycles)
		}
		static setOptions(doc) {
			super.setOptions(doc)
			Options.toggleExplanation(doc,"aimu")
		}
	}

		class AIMUDispenserDemo extends AIMUDemo {
		    constructor(options) {
				super(options,SimpleDispenserGrid,environments.dispenser1)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setParams(doc,{horizon:10,samples:1000,cycles:60})
			}
		}

		class AIMUEpisodicDemo extends AIMUDemo {
			constructor(options) {
				super(options,POEpisodicGrid,environments.episodic1)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setParams(doc,{horizon:30,samples:2000,cycles:40})
			}
		}

	class AIXIDemo extends BayesDemo {
		constructor(options,cl,cfg) {
	        var env = new cl(cfg)
	        options.getEnvParams(env)
	        options.prior_type = "Uniform"
			options.model_class = env.modelClass(cfg)
	        var agent = new BayesAgent(options)
	        super(env,agent,AIXIVis,options.cycles)
	    }
		static setOptions(doc) {
			super.setOptions(doc)
			Options.toggleExplanation(doc,"bayes")
		}
	}

		class AIXIDispenserDemo extends AIXIDemo {
			constructor(options) {
				super(options,SimpleDispenserGrid,environments.dispenser1)
			}
		}

		class AIXIEpisodicDemo1 extends AIXIDemo {
			constructor(options) {
		        super(options,SimpleEpisodicGrid,environments.episodic1)
			}
		}

		class AIXIEpisodicDemo2 extends AIXIDemo {
			constructor(options) {
				super(options,SimpleEpisodicGrid,environments.episodic2)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setParams(doc,{horizon:10,samples:1000,cycles:100})
			}
		}

		class AIXITigerDemo extends AIXIDemo {
			constructor(options) {
				super(options,SignPostedTigerGrid,environments.tiger1)
		    }
		}

		class AIXIBanditDemo extends AIXIDemo {
			constructor(options) {
				var dists = []
				for (var i = 0; i < 2; i++) {
					dists.push(new NormalDistribution(10 * Math.random(),20 * Math.random() - 10))
				}
				super(options,Bandit,dists)
			}
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setParams(doc,{horizon:1,samples:1000,cycles:100})
			}
		}

class ThompsonDemo extends Demo {
	constructor(options,cfg) {
		var cl = SimpleDispenserGrid
		var env = new cl(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.model_class = env.modelClass(cfg)
        var agent = new ThompsonAgent(options)
        super(env,agent,ThompsonVis,options.cycles)
	}
	static setOptions(doc) {
		Options.toggleExplanation(doc,"thompson")
		Options.setParams(doc,{horizon:3,samples:500,cycles:500})
	}
}

	class ThompsonDemo1 extends ThompsonDemo {
	    constructor(options) {
	        super(options,environments.dispenser1)
	    }
	}

	class ThompsonDemo2 extends ThompsonDemo {
		constructor(options) {
			super(options,environments.dispenser2)
		}
	}

class HeavenHell extends Demo {

}

class SquareKSADemo extends BayesDemo {
	constructor(options) {
		var cfg = environments.episodic1
		var cl = POEpisodicGrid
		var env = new cl(cfg)
		options.getEnvParams(env)
		options.prior_type = "Uniform"
		options.model_class = env.modelClass(cfg)
		var agent = new SquareKSA(options)
		super(env,agent,AIXIVis,options.cycles)
	}
	static setOptions(doc) {
		Options.setParams(doc,{horizon:3,samples:500,cycles:500})
		Options.toggleExplanation(doc,"ksa")
	}
}

class ShannonKSADemo extends BayesDemo {
	constructor(options) {
		var cfg = environments.episodic1
		var cl = POEpisodicGrid
		var env = new cl(cfg)
		options.getEnvParams(env)
		options.prior_type = "Uniform"
		options.model_class = env.modelClass(cfg)
		var agent = new ShannonKSA(options)
		super(env,agent,AIXIVis,options.cycles)
	}
	static setOptions(doc) {
		Options.setParams(doc,{horizon:3,samples:500,cycles:500})
		Options.toggleExplanation(doc,"ksa")
	}
}

class ShannonNoise extends Demo {

}

// etc
