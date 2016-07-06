class Demo {
	constructor(dem) {
		this.dem = dem
		this.ui = new UI()
	}
	run() {
		var env = new this.dem.env(this.dem.config)
		var options = this.ui.getOptions()
		if (options == null) {
			console.error("Bad options.")
			return false
		}
		options.getEnvParams(env)
		var agent = new this.dem.agent(options)
        var trace = new agent.tracer(options.cycles)
		var a
		var e = env.generatePercept()
        for (var t = 0; t < options.cycles; t++) {
			trace.log(agent,env,a,e)
			a = agent.selectAction(e)
			env.perform(a)
			e = env.generatePercept()
			agent.update(a,e)
        }
		this.agent = agent
		this.env = env
		this.trace = trace
		this.vis = new this.dem.vis(env,trace)
		this.ui.showNav()
    }
	static new() {
		if (demo && demo.vis) {
			demo.vis.pause()
		}
		var e = document.getElementById("demo_select")
		var name = e.options[e.selectedIndex].value
		var dem
		for (var d in demos) {
			if (demos[d].name == name) {
				dem = demos[d]
				break
			}
		}
		Util.assert(dem != undefined)
		demo = new Demo(dem)
		demo.ui.showAgentParams(dem.params)
		demo.ui.clearExplanations()
		if (!dem.exps) {
			return
		}
		for (var exp of dem.exps) {
			demo.ui.showExplanation(exp)
		}
	}
}
