agents = {
    BayesAgent,
    QLearn,
    SARSA
}

environments = {
    SimpleDispenserGrid,
    SimpleEpisodicGrid
}

configs = {
    dispenser1 : {
        name : "dispenser1",
        map :   [["F","F","F","F","F"],
                ["W","W","F","W","F"],
                ["W","F","F","F","W"],
                ["F","F","F","W","W"],
                ["W","W","F","W","W"]],
        freqs : [0.5],
        optimal_average_reward : 5,
        initial_pos : {
            x : 0,
            y : 0
        },
        dispenser_pos : {
            x : 4,
            y : 2
        }
    },
    episodic1 : {
        name : "episodic1",
        map :   [["F","F","W","F","F","F","F","F","F"],
                ["F","F","W","F","F","F","F","F","F"],
                ["F","W","W","F","F","F","F","F","F"],
                ["F","F","F","F","F","F","F","F","F"],
                ["F","W","W","W","W","W","W","F","F"],
                ["F","F","W","F","F","F","W","F","F"],
                ["F","F","W","F","W","C","W","F","F"],
                ["F","F","W","F","W","W","W","F","F"],
                ["F","F","W","F","F","F","F","F","F"]],
        optimal_average_reward : r_chocolate/26,
        initial_pos : {
            x : 0,
            y : 0
        }
    }
}
