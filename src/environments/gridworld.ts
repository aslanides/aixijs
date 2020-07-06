import {Environment} from './base';
import * as util from '../utils/util';
import {Reward, Action, Percept} from '../types';
import {GridVisualisation} from '../visualisations/gridvis';
import {BayesMixture} from '../models/mixture';
import {Model} from '../models/base';
import {Simulator} from '../models/simulator';

interface GridworldOptions {
  map?: string[][]; // Map to use, if any.

  statePercepts: boolean; // Whether to use tabular percepts (MDP) or POMDP.

  size: number; // Gridworld size

  initial?: {x: number; y: number}; // Optional; initial state of agent.

  goals: Array<{x?: number; y?: number; freq: number}>;
  trapProb?: number; // Default prob that any given tile is a trap.
  wallProb?: number; // Default prob that any given tile is a wall.
}

export class Gridworld implements Environment {
  /* A gridworld environment.

	TODO(aslanides): Detailed docstring.
	*/

  options: GridworldOptions; // Save options.

  // Gridworld state.
  grid: Tile[][];
  pos: Tile;
  reward: Reward;
  hitWall = false;
  state: {x: number; y: number; reward: Reward}; // Saved state.

  // Configuration.
  size: number;
  statePercepts: boolean;
  numActions: number;
  minReward: Reward;
  maxReward: Reward;
  goals: Dispenser[];

  visitedStates: number; // Counts the number of visited states.
  numStates = 0; // Incremented when validated.
  valid = false; //

  // Action space.
  static actions = [
    [-1, 0], // left
    [1, 0], // right
    [0, -1], // up
    [0, 1], // down
    [0, 0], // noop
  ];

  // Reward for each tile type.
  static rewards = {
    chocolate: 100,
    wall: -5,
    empty: 0,
    move: -1,
  };

  // For interpreting ASCII maps.
  static mapSymbols = {
    empty: 'F',
    chocolate: 'C',
    wall: 'W',
    dispenser: 'D',
    sign: 'S',
    trap: 'T',
    modifier: 'M',
  };

  constructor(options: GridworldOptions) {
    /* Builds a new gridworld. */

    // Environment configuration.
    this.options = util.deepCopy(options);
    this.size = options.size;
    util.assert(options.size < 50, 'Not recommended to have size >= 50.');

    // State.
    this.reward = -1; // fix name conflict
    this.visitedStates = 0;

    // Set up metadata (reward bounds, observation type, num actions).
    this.statePercepts = options.statePercepts;
    this.numActions = Gridworld.actions.length;
    this.minReward = Gridworld.rewards.wall + Gridworld.rewards.move;
    this.maxReward = Gridworld.rewards.chocolate + Gridworld.rewards.move;

    // Build grid.
    this.grid = [];
    const map = options.map as string[][];
    for (let i = 0; i < this.size; i++) {
      this.grid[i] = new Array<Tile>(this.size);
      for (let j = 0; j < this.size; j++) {
        const tileType = map[j][i];
        this.grid[i][j] = newTile(i, j, tileType);
      }
    }

    // Construct goal tiles.
    this.goals = [];
    for (const goal of options.goals) {
      const goalX = goal.x as number;
      const goalY = goal.y as number;
      const g = new Dispenser(goalX, goalY, goal.freq);
      this.grid[goalX][goalY] = g;
      this.goals.push(g);
    }

    // Generate connections between tiles.
    this.generateConnexions();

    // Set initial position.
    if (options.initial) {
      this.pos = this.grid[options.initial.x][options.initial.y];
    } else {
      this.pos = this.grid[0][0];
    }

    //
    this.state = {x: this.pos.x, y: this.pos.y, reward: this.reward};
  }

  private generateConnexions() {
    /* TODO(aslanides): docstring. */
    const grid = this.grid;
    const actions = Gridworld.actions;
    grid.forEach((row, idx) => {
      row.forEach((tile, jdx) => {
        let str = '';
        for (let a = 0; a < this.numActions; a++) {
          const i = actions[a][0];
          const j = actions[a][1];
          if (
            !grid[idx + i] ||
            !grid[idx + i][jdx + j] ||
            grid[idx + i][jdx + j].constructor === Wall
          ) {
            str += '1';
          } else {
            if (i || j) {
              str += '0';
            }
            // Add a path from this tile to its neighbor.
            if (tile.constructor !== Wall) {
              tile.neighbors[a] = grid[idx + i][jdx + j];
            }
          }
        }
        if (this.statePercepts) {
          tile.obs = idx * this.size + jdx;
        } else {
          tile.obs = +str >> 0; // Convert binary string to integer.
        }
      });
    });
  }

  validate(): boolean {
    /* Validates that this gridworld is solvable. */
    const queue: Tile[] = [];
    let pos = 0;

    // Find the 'best' goal.
    let maxFreq = 0;
    for (const goal of this.goals) {
      if (goal.freq > maxFreq) {
        maxFreq = goal.freq;
      }
    }

    // Mark all tiles as unvisited.
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j].expanded = false;
      }
    }

    this.numStates = 1;
    queue.push(this.grid[0][0]);
    while (pos < queue.length) {
      const ptr = queue[pos];
      ptr.expanded = true;
      for (const t of ptr.neighbors) {
        if (!t || t.expanded) {
          continue;
        }

        this.numStates++;
        if (
          (t.constructor === Dispenser && (t as Dispenser).freq === maxFreq) ||
          t.constructor === Chocolate
        ) {
          this.valid = true;
        }

        t.expanded = true;
        queue.push(t);
      }

      pos++;
    }

    return this.valid;
  }

  perform(action: Action) {
    let rew = Gridworld.rewards.move;
    const t = this.pos.neighbors[action];

    if (t) {
      rew += t.reward();
      if (!t.visited) {
        t.visited = true;
        this.visitedStates++;
      }

      this.pos = t;
      this.hitWall = false;
    } else {
      rew += Gridworld.rewards.wall;
      this.hitWall = true;
    }

    rew += this.dynamics(this.pos);
    this.reward = rew;
  }

  dynamics(tile: Tile): Reward {
    tile.dynamics();
    return 0;
  }

  generatePercept(): Percept {
    return {
      obs: this.pos.obs as number,
      rew: this.reward,
    };
  }

  save() {
    this.state = {
      x: this.pos.x,
      y: this.pos.y,
      reward: this.reward,
    };
  }

  load() {
    this.pos = this.grid[this.state.x][this.state.y];
    this.reward = this.state.reward;
  }

  copy() {
    const res = new Gridworld(this.options);
    res.pos = res.grid[this.pos.x][this.pos.y];
    res.reward = this.reward;

    return res;
  }

  getState(): object {
    return {x: this.pos.x, y: this.pos.y};
  }

  conditionalDistribution(e: Percept) {
    const p = this.generatePercept();
    const s = this.pos;
    const rew = e.rew - Gridworld.rewards.move;

    // NoiseTile has stochastic observation & deterministic reward.
    if (s.constructor === NoiseTile) {
      return e.rew === p.rew ? (s as NoiseTile).prob : 0;
    }

    // Observations are deterministic.
    if (e.obs !== p.obs) {
      return 0;
    }

    // All tiles except the goal have deterministic rewards.
    if (!s.goal) {
      return e.rew === p.rew ? 1 : 0;
    }

    // Dispenser yields stochastic rewards.
    if (rew === Gridworld.rewards.chocolate) {
      return (s as Dispenser).freq;
    }
    if (rew === Gridworld.rewards.empty) {
      return 1 - (s as Dispenser).freq;
    }

    //
    return rew === Gridworld.rewards.wall && this.hitWall ? 1 : 0;
  }

  info() {
    return {};
  }
}

export function generateRandom(options: GridworldOptions): Gridworld {
  const opt = util.deepCopy(options);
  const size = options.size;
  const trapProb = options.trapProb || 0;
  const wallProb = options.wallProb || 0.4;

  opt.map = [];

  // Generate a random maze.
  for (let i = 0; i < size; i++) {
    opt.map[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      // Always make the top left corner empty.
      if (i === 0 && j === 0) {
        opt.map[i][j] = Gridworld.mapSymbols.empty;
      }

      // Draw a tile (trap, wall, or empty).
      const r = Math.random();
      if (r < trapProb) {
        opt.map[i][j] = Gridworld.mapSymbols.trap;
      } else if (r < wallProb) {
        opt.map[i][j] = Gridworld.mapSymbols.wall;
      } else {
        opt.map[i][j] = Gridworld.mapSymbols.empty;
      }
    }
  }

  // Generate random goal positions.
  for (const goal of opt.goals) {
    goal.x = util.randi(size / 4, size);
    goal.y = util.randi(size / 4, size);
    opt.map[goal.y][goal.x] = Gridworld.mapSymbols.chocolate;
  }

  // Generate environment.
  const env = new Gridworld(opt);
  env.validate();
  if (!env.valid) {
    return generateRandom(options);
  }

  return env;
}

export function makeModel(env: Gridworld, modelType: string): Model {
  const modelClass = [];
  let modelWeights = [];
  const options = util.deepCopy(env.options);

  if (modelType === 'mu') {
    modelClass.push(new Gridworld(options));
    modelWeights = [1];
  } else if (modelType === 'maze') {
    for (let n = 4; n < options.size; n++) {
      options.size = n;
      for (let k = 0; k < n; k++) {
        modelClass.push(generateRandom(options));
        modelWeights.push(1);
      }
    }

    modelClass.push(new Gridworld(options));
    modelWeights.push(1);
  } else {
    const C = options.size * options.size;
    modelWeights = [...util.zeros(C)];

    for (let i = 0; i < options.size; i++) {
      for (let j = 0; j < options.size; j++) {
        if (modelType === 'goal') {
          options.goals = [
            {
              x: j,
              y: i,
              freq: options.goals[0].freq,
            },
          ];
        } else if (modelType === 'pos') {
          options.initial = {x: j, y: i};
        }

        const t = env.grid[j][i];
        if (t.constructor === Wall || !t.expanded) {
          modelWeights[i * options.size + j] = 0;
        } else {
          modelWeights[i * options.size + j] = 1 / C; // default uniform
        }

        const m = new Gridworld(options);

        modelClass.push(m);
      }
    }
  }

  const simulators: Simulator[] = [];
  modelClass.forEach((e: Environment) => simulators.push(new Simulator(e)));

  // ensure prior is normalised
  const C = modelWeights.length;
  const s = util.sum(modelWeights);
  for (let i = 0; i < C; i++) {
    modelWeights[i] /= s;
  }
  return new BayesMixture(simulators, modelWeights);
}

export function newTile(
  i: number,
  j: number,
  type: string,
  freq?: number
): Tile {
  switch (type) {
    case Gridworld.mapSymbols.empty:
      return new Tile(i, j);
    case Gridworld.mapSymbols.wall:
      return new Wall(i, j);
    case Gridworld.mapSymbols.chocolate:
      return new Chocolate(i, j);
    case Gridworld.mapSymbols.dispenser:
      return new Dispenser(i, j, freq as number);
    case Gridworld.mapSymbols.trap:
      return new Trap(i, j);
    case Gridworld.mapSymbols.modifier:
      return new SelfModificationTile(i, j);
    default:
      throw new Error(`Error: unknown Tile type: ${type}.`);
  }
}

export class Tile {
  /* TODO(aslanides): docstring. */

  // Position and neighbors in grid.
  x: number;
  y: number;
  neighbors: Tile[];

  // Observations/rewards associated with this tile.
  rew = Gridworld.rewards.empty; // Reward for landing on this tile.
  symbol: number; // What it looks like from afar.
  obs?: number; // Observation on this tile.

  // Default properties.
  legal = true;
  goal = false;

  //
  expanded?: boolean; //
  visited?: boolean; //
  parent?: Tile;

  // For rendering.
  color = GridVisualisation.colors.empty;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.symbol = 0;
    this.neighbors = [];
  }

  reward(): Reward {
    return this.rew;
  }

  dynamics(): void {}
}

export class Wall extends Tile {
  color = GridVisualisation.colors.wall;
  rew = Gridworld.rewards.wall;
  legal = false;
  symbol = 1;
}

export class Chocolate extends Tile {
  color = GridVisualisation.colors.chocolate;
  rew = Gridworld.rewards.chocolate;
}

export class Dispenser extends Tile {
  freq: number; // Relative frequency of r2/r1.
  rew = Gridworld.rewards.chocolate;
  rew2 = Gridworld.rewards.empty;
  color = GridVisualisation.colors.dispenser;
  goal = true;

  constructor(x: number, y: number, freq: number) {
    super(x, y);
    this.freq = freq;
  }

  reward(): Reward {
    return Math.random() < this.freq ? this.rew : this.rew2;
  }
}

export class Trap extends Tile {
  color = GridVisualisation.colors.trap;
  rew = Gridworld.rewards.wall;
}

export class SelfModificationTile extends Tile {
  color = GridVisualisation.colors.modifier;
  rew = Gridworld.rewards.empty;
}

export class NoiseTile extends Tile {
  numObs = Math.pow(2, 2);
  prob: number;
  rew = Gridworld.rewards.empty;
  constructor(x: number, y: number) {
    super(x, y);
    this.prob = 1 / this.numObs;
    this.dynamics = () => {
      this.obs = util.randi(0, this.numObs);
    };
  }
}
