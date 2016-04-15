function init() {
    init_menu(agents,"agent_select")
    init_menu(environments,"env_select")
    init_menu(configs,"conf_select")
}

function init_menu(obj,str) {
    for (var o in obj) {
        var x = document.getElementById(str)
        var option = document.createElement("option")
        option.text = obj[o].name
        x.add(option)
    }
}

function start() {
    conf = configs[document.getElementById("conf_select").value]

    env = new environments[document.getElementById("env_select").value](conf)

    options = new Options(document,env)

    if (env.constructor.name == "SimpleDispenserGrid") {
        options.prior_type = "Mu"
        options.midx = env.grid.M * env.grid.disp[0][0] + env.grid.disp[0][1]
        options.model_class = make_M(SimpleDispenserGrid,conf)
    }

    agent = new agents[document.getElementById("agent_select").value](options)

    hist = simulate(env,agent,options.t_max)
    
    vis = new Visualisation(env,hist)
}

function make_M(env_class,conf) {
    var model_class = []
    var cfg = Util.deepcopy(conf)
    for (var i = 0; i < cfg.map.length; i++) {
        for (var j = 0; j < cfg.map[0].length; j++) {
            cfg.dispenser_pos = {x:i,y:j}
            var model = new env_class(cfg)
            model_class.push(model)
        }
    }
    return model_class
}
