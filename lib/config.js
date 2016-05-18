const demos = {
    QLearnDemo,
    QLearnDemo2,
    AIMUDemo,
    AIXIDemo,
	AIMUDemo2,
	AIXIDemo2,
    ThompsonDemo,
	SquareKSADemo
}

const r_chocolate = 100
const r_wall = -5
const r_empty = -1

const m_empty = "F"
const m_chocolate = "C"
const m_wall = "W"
const m_dispenser = "D"

const c_empty = "grey"
const c_wall = "black"
const c_chocolate = "yellow"
const c_dispenser = "orange"
const c_agent = "blue"

const environments = {
    dispenser1 : {
        name : "dispenser1",
        map :   [["F","F","F","F","F"],
                ["W","W","F","W","F"],
                ["W","F","F","F","W"],
                ["F","F","F","W","W"],
                ["W","W","F","W","W"]],
        freqs : [0.5],
        initial_pos : {
            x : 0,
            y : 0
        },
        dispenser_pos : {
            x : 4,
            y : 2
        }
    },
    dispenser2 : {
        name : "dispenser2",
        map :   [["F","F","F","F","F"],
                ["F","F","F","F","F"],
                ["F","F","F","F","F"],
                ["F","F","F","F","F"],
                ["F","F","F","F","F"]],
        initial_pos : {
            x : 0,
            y : 0
        },
        freqs : [1],
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
                ["F","F","W","F","W","F","W","F","F"],
                ["F","F","W","F","W","W","W","F","F"],
                ["F","F","W","F","F","F","F","F","F"]],
        initial_pos : {
            x : 0,
            y : 0
        },
		chocolate_pos : {
			x : 6,
			y : 5
		}
    }
}
