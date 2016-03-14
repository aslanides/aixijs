var params = {
    agent : {
        epsilon : 0.01,
        gamma : 0.99,
        alpha: 0.1,
    },
    environment : {
        allowed_actions : ["L","R","U","D"]
        M : 9
        N : 9
    }
}
var map = [["F","F","W","F","F","F","F","F","F"],
            ["F","F","W","F","F","F","F","F","F"],
            ["F","T","W","F","F","F","F","F","F"],
            ["F","F","F","F","F","F","F","F","F"],
            ["F","T","W","W","W","W","W","F","F"],
            ["F","F","W","F","F","F","W","F","F"],
            ["F","F","W","F","W","C","W","F","F"],
            ["F","F","W","F","W","W","W","F","F"],
            ["F","F","W","F","F","F","F","F","F"]]

// constants
const N = 9;
const d = 40;
//TODO don't hard code pixel sizes; compute from screen resolution
const fps = 50;
// TODO event driven frame updates
const D = d + 1;
// TODO look at JQuery!

agent = new Agent(params)
env = new Environment(map)
for (i = 0; i < 10; i++) {
    s = env.state()
    a = agent.select_action(s)
}
