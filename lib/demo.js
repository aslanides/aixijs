class Demo {
    constructor() {
        this.env
        this.agent
        this.vis

        Demo.init_menu(agents,"agent_select")
        Demo.init_menu(environments,"env_select")
        Demo.init_menu(configs,"conf_select")
    }
    run(doc) {
        var conf = configs[doc.getElementById("conf_select").value]
        this.env = new environments[doc.getElementById("env_select").value](conf)
        var options = new Options(doc,this.env)
        if (this.env.constructor.name == "SimpleDispenserGrid") {
            // TODO clean up
            options.prior_type = "Mu"
            options.midx = this.env.grid.M * this.env.grid.disp[0][0] + this.env.grid.disp[0][1]
            options.model_class = Options.make_M(SimpleDispenserGrid,conf)
        }
        this.agent = new agents[doc.getElementById("agent_select").value](options)
        var hist = this.simulate(this.env,this.agent,options.t_max)
        this.vis = new Visualization(this.env,hist)
    }
    simulate(env,agent,t) {
        var history = []
        var r_total = env.initial_percept.rew
        var s = env.initial_percept.obs
        for (var iter = 0; iter < t; iter++) {
            var slice = {
                obs : s,
                reward : r_total,
                pos : env.pos
            }
            var a = agent.select_action(s)
            var percept = env.perform(a)
            var s_ = percept.obs
            var r = percept.rew
            agent.update(s,a,r,s_)
            s = s_

            r_total += r
            history.push(slice)
        }
        return history
    }
    static init_menu(obj,str) {
        for (var o in obj) {
            var x = document.getElementById(str)
            var option = document.createElement("option")
            option.text = obj[o].name
            x.add(option)
        }
    }
}

function init() {
    demo = new Demo(document)
}
