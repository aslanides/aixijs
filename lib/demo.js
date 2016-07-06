class Demo {
	constructor(dem) {
		this.dem = dem
		this.ui = new UI()
	}
	run() {
		let env = new this.dem.env(this.dem.config)
		let options = this.ui.getOptions()
		if (options == null) {
			console.error('Bad options.')
			return false
		}
		options.getEnvParams(env)
		let agent = new this.dem.agent(options)
        let trace = new agent.tracer(options.cycles)
		let a
		let e = env.generatePercept()
        for (let t = 0; t < options.cycles; t++) {
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
		let e = document.getElementById('demo_select')
		let name = e.options[e.selectedIndex].value
		let dem
		for (let d in demos) {
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
		for (let exp of dem.exps) {
			demo.ui.showExplanation(exp)
		}
	}
}
