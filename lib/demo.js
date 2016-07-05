var demo

class Demo {
	constructor(env,agent,vis,cycles) {
		this.agent = agent
		this.env = env
        this.trace = new agent.tracer(cycles)
		var a
		var e = env.generatePercept()
        for (var t = 0; t < cycles; t++) {
			this.trace.log(agent,env,a,e)
			a = agent.selectAction(e)
			env.do(a)
			e = env.generatePercept()
			agent.update(a,e)
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

class RandomEpisodic extends Demo {
	constructor(options) {
		var env = new SimpleEpisodicGrid(config.environments.episodic1)
		options.getEnvParams(env)
		var agent = new RandomAgent(options)
		super(env,agent,GridVisualization,options.cycles)
	}
	static setOptions(doc) {
		Options.setAgentParams(doc,{cycles:1e5})
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
		Options.setAgentParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e5})
	}
}

	class QLearnEpisodic extends QLearnDemo {
	    constructor(options) {
			super(options,SimpleEpisodicGrid,TabularGridVis,config.environments.episodic1)
	    }
	}

	class QLearnDispenser extends QLearnDemo {
	    constructor(options) {
	        super(options,SimpleDispenserGrid,TabularGridVis,config.environments.dispenser1)
	    }
	}

	class QLearnBandit extends QLearnDemo {
		constructor(options) {
			var dists = []
			for (var i = 0; i < 2; i++) {
				dists.push(new NormalDistribution(10 * Math.random(),20 * Math.random() + 1))
			}
			super(options,Bandit,GaussianBanditVis,dists)
		}
		static setOptions(doc) {
			super.setOptions(doc)
			Options.setAgentParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e3})
		}
	}

	class QLearnMDP extends QLearnDemo {
		constructor(options){
			super(options, BasicMDP, MDPVis,config.environments.MDP1)
		}
		static setOptions(doc) {
			super.setOptions(doc)
			Options.setAgentParams(doc,{alpha:0.9,gamma:0.99,epsilon:0.01,cycles:1e3})
		}
	}
class BayesDemo extends Demo {
	static setOptions(doc) {
		Options.setAgentParams(doc,{horizon:6,samples:400,ucb:1,cycles:1e2})
	}
}

	class AIMUDemo extends BayesDemo {
		constructor(options,cl,cfg) {
			var env = new cl(cfg)
	        options.getEnvParams(env)
	        options.prior_type = "Informed"
			options.mu = env.N * cfg.goal_pos.x + cfg.goal_pos.y
			options.model_class = cl.modelClass(cl,cfg)
	        var agent = new BayesAgent(options)
	        super(env,agent,AIXIVis,options.cycles)
		}
		static setOptions(doc) {
			super.setOptions(doc)
			Options.toggleExplanation(doc,"aimu")
		}
	}

		class AIMUDispenser1 extends AIMUDemo {
		    constructor(options) {
				super(options,SimpleDispenserGrid,config.environments.dispenser1)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setAgentParams(doc,{horizon:10,samples:1000,cycles:60})
			}
		}

		class AIMUDispenser2 extends AIMUDemo {
		    constructor(options) {
				super(options,SimpleDispenserGrid,config.environments.dispenser3)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setAgentParams(doc,{horizon:6,samples:1000,cycles:60})
			}
		}

		class AIMUEpisodic extends AIMUDemo {
			constructor(options) {
				super(options,EpisodicGrid,config.environments.episodic1)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setAgentParams(doc,{horizon:30,samples:2000,cycles:40})
			}
		}

	class AIXIDemo extends BayesDemo {
		constructor(options,cl,cfg) {
	        var env = new cl(cfg)
	        options.getEnvParams(env)
	        options.prior_type = "Uniform"
			options.model_class = cl.modelClass(cl,cfg)
	        var agent = new BayesAgent(options)
	        super(env,agent,AIXIVis,options.cycles)
	    }
		static setOptions(doc) {
			super.setOptions(doc)
			Options.toggleExplanation(doc,"bayes")
		}
	}

		class AIXIDispenser extends AIXIDemo {
			constructor(options) {
				super(options,SimpleDispenserGrid,config.environments.dispenser1)
			}
		}

		class AIXIEpisodic1 extends AIXIDemo {
			constructor(options) {
		        super(options,SimpleEpisodicGrid,config.environments.episodic1)
			}
		}

		class AIXIEpisodic2 extends AIXIDemo {
			constructor(options) {
				super(options,EpisodicGrid,config.environments.episodic2)
		    }
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setAgentParams(doc,{horizon:10,samples:1000,cycles:100})
			}
		}

		class AIXIWindy extends AIXIDemo {
			constructor(options) {
				super(options,DeterministicWindyGrid,config.environments.windy)
			}
		}

		class AIXITiger extends AIXIDemo {
			constructor(options) {
				super(options,SignPostedTigerGrid,config.environments.tiger1)
		    }
		}

		class AIXIBandit extends AIXIDemo {
			constructor(options) {
				var dists = []
				for (var i = 0; i < 2; i++) {
					dists.push(new NormalDistribution(10 * Math.random(),20 * Math.random() - 10))
				}
				super(options,Bandit,dists)
			}
			static setOptions(doc) {
				super.setOptions(doc)
				Options.setAgentParams(doc,{horizon:1,samples:1000,cycles:100})
			}
		}

class ThompsonDemo extends Demo {
	constructor(options,cfg) {
		var cl = SimpleDispenserGrid
		var env = new cl(cfg)
        options.getEnvParams(env)
        options.prior_type = "Uniform"
        options.model_class = cl.modelClass(cl,cfg)
        var agent = new ThompsonAgent(options)
        super(env,agent,ThompsonVis,options.cycles)
		//BayesGridVis.drawMCTSTree(this.agent.search_tree.root)
	}
	static setOptions(doc) {
		Options.toggleExplanation(doc,"thompson")
		Options.setAgentParams(doc,{horizon:5,samples:1200,ucb:1,cycles:200})
	}
}

	class Thompson1 extends ThompsonDemo {
	    constructor(options) {
	        super(options,config.environments.dispenser3)
	    }
	}

	class Thompson2 extends ThompsonDemo {
		constructor(options) {
			super(options,config.environments.dispenser2)
		}
	}

	class ThompsonDispenser extends ThompsonDemo {
		constructor(options) {
			super(options,config.environments.dispenser1)
		}
	}

class HeavenHell extends Demo {

}

class KSADemo extends BayesDemo {
	constructor(options,cl_a,cl_e,cfg) {
		var env = new cl_e(cfg)
		options.getEnvParams(env)
		options.prior_type = "Uniform"
		options.model_class = cl_e.modelClass(cl_e,cfg)
		var agent = new cl_a(options)
		super(env,agent,AIXIVis,options.cycles)
	}
	static setOptions(doc) {
		Options.setAgentParams(doc,{horizon:3,samples:500,ucb:1,cycles:500})
		Options.toggleExplanation(doc,"ksa")
	}
}

class SquareKSAEpisodic extends KSADemo {
	constructor(options) {
		super(options,SquareKSA,EpisodicGrid,config.environments.episodic1)
	}
}

class ShannonKSAEpisodic extends KSADemo {
	constructor(options) {
		super(options,ShannonKSA,EpisodicGrid,config.environments.episodic1)
	}
}

class SquareKSADispenser extends KSADemo {
	constructor(options) {
		super(options,SquareKSA,SimpleDispenserGrid,config.environments.dispenser1)
	}
}

class ShannonNoise extends Demo {

}
