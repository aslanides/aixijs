class Test {
    static config() {
        return {
            map :   [["F","W"],
                    ["F","F"],
                    ["W","F"]],
            initial_pos : {
                x: 1,
                y: 1
            },
            freqs : [1]
        }
    }
    static do(env,a) { //useful helper
        env.do(a)
        return env.generatePercept()
    }
}
