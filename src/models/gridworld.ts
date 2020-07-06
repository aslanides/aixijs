import {Model} from './base';
import {Percept, Action} from '../types';
import * as util from '../utils/util';
import {Queue} from '../utils/queue';
import {
  Gridworld,
  Tile,
  Dispenser,
  Wall,
  Trap,
} from '../environments/gridworld';
import {Dirichlet, Distribution} from '../utils/distribution';

export class DirichletGrid implements Model {
  /* A Dirichlet model for a gridworld. */

  // Environment parameters.
  A: number; // Size of action space.
  size: number; // Size of the gridworld.
  T = 4; // Grid connection topology

  // Model state.
  grid: DirichletTile[][];
  pos: DirichletTile;
  savedPos: {x: number; y: number};

  params: number[][][]; //
  paramQueue: Queue<number[]>;
  savedParams: number[][][];

  weights: Float32Array;
  weightQueue: Queue<number>;
  savedWeights: number[];

  actions: number[][];
  numActions: number;

  e?: Percept;

  // TODO(aslanides): document this.
  wall: DirichletTile;

  constructor(size: number) {
    this.actions = Gridworld.actions;
    this.numActions = this.actions.length;
    this.A = this.actions.length;
    this.size = size;

    this.grid = [];
    this.params = [];
    this.weightQueue = new Queue();
    this.paramQueue = new Queue();

    for (let idx = 0; idx < this.size; idx++) {
      const gridrow = [];
      const prow = [];
      for (let jdx = 0; jdx < this.size; jdx++) {
        gridrow.push(new DirichletTile(idx, jdx));
        prow.push(gridrow[jdx].pr.alphas);
      }

      this.grid.push(gridrow);
      this.params.push(prow);
    }

    this.savedParams = [];
    for (let i = 0; i < this.size; i++) {
      this.savedParams[i] = util.arrayCopy(this.params[i]);
    }

    this.weights = util.zeros(this.size * this.size);
    for (let i = 0; i < this.size * this.size; i++) {
      this.weights[i] = this.grid[0][0].prob(1); // Haldane prior
    }

    this.savedWeights = [...this.weights];

    this.wall = new DirichletTile(0, 0);
    this.wall.rew = Gridworld.rewards.wall;
    this.wall.legal = false;
    this.wall.symbol = 1;
    this.wall.prob = i => util.I(i, 2);
    this.wall.update = _ => _;
    this.wall.sample = () => this.wall;

    this.pos = this.grid[0][0];
    this.savedPos = {x: 0, y: 0};

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const t = this.grid[i][j];
        const ne = [];
        for (const dir of this.actions) {
          if (dir[0] === 0 && dir[1] === 0) {
            continue; // don't return self
          }

          const newx = t.x + dir[0];
          const newy = t.y + dir[1];
          if (newx < 0 || newy < 0 || newx >= this.size || newy >= this.size) {
            ne.push(this.wall);
            continue;
          }

          ne.push(this.grid[newx][newy]);
        }

        t.neighbors = ne;
      }
    }

    this.perform(4);
    this.pos.update(0);
    this.pos.update(1);
  }

  generatePercept(): Percept {
    return this.e as Percept;
  }

  conditionalDistribution(e: Percept): number {
    const oBits: number[] = [];
    util.encode(oBits, e.obs, this.A - 1);
    oBits.reverse();

    const s = this.pos;
    const ne = s.neighbors;

    let p = 1;
    for (let i = 0; i < this.A - 1; i++) {
      if (oBits[i]) {
        p *= ne[i].prob(2); // wall
      } else {
        p *= 1 - ne[i].prob(2);
      }
    }

    const rew = e.rew - Gridworld.rewards.move;
    if (rew === Gridworld.rewards.chocolate) {
      p *= s.prob(1);
    } else if (rew === Gridworld.rewards.empty) {
      p *= s.prob(0);
    }

    return p;
  }

  perform(a: Action) {
    let s = this.pos;

    const samples = [];
    for (let i = 0; i < s.neighbors.length; i++) {
      samples.push(s.neighbors[i].sample());
    }

    const t = samples[a];

    let str = '';
    for (const sam of samples) {
      str += sam.symbol;
    }

    let wallHit = false;

    // if agent moved, we have to re-sample
    if (a !== 4 && !t.symbol) {
      str = '';
      const ne2 = this.grid[t.x][t.y].neighbors;
      for (const n of ne2) {
        if (n === s) {
          str += 0;
          continue;
        }

        const sam = n.sample();
        str += sam.symbol;
      }

      s = t.parent as DirichletTile;
    } else if (a !== 4 && t.symbol) {
      wallHit = true;
    }

    this.pos = s;

    const pEmpty = s.prob(0);
    const pDisp = s.prob(1);
    const norm = pEmpty + pDisp;
    const disp = util.sample([pEmpty / norm, pDisp / norm]);

    const o = parseInt(str, 2);
    let r = Gridworld.rewards.empty;
    if (wallHit) {
      r = Gridworld.rewards.wall;
    } else if (disp) {
      r = Gridworld.rewards.chocolate;
    }

    r += Gridworld.rewards.move;

    this.e = {obs: o, rew: r};
  }

  bayesUpdate(a: Action, e: Percept) {
    const o = e.obs;
    const r = e.rew;
    const oBits: number[] = [];
    util.encode(oBits, o, this.A - 1);
    oBits.reverse();

    const s = this.pos;
    const ne = s.neighbors;
    for (let i = 0; i < this.A - 1; i++) {
      const n = ne[i];
      if (!n.pr) {
        continue;
      }

      if (oBits[i]) {
        n.update(2); // wall
      } else {
        if (n.pr.alphas[0] === 0 && n.pr.alphas[1] === 0) {
          n.update(0);
          n.update(1);
        }
      }

      this.weights[n.y * this.size + n.x] = n.prob(1);
      this.weightQueue.push(n.y * this.size + n.x);

      if (n.pr) {
        this.params[n.x][n.y] = n.pr.alphas;
        this.paramQueue.push([n.x, n.y]);
      }
    }

    const rew = r - Gridworld.rewards.move;

    if (rew === Gridworld.rewards.empty) {
      s.update(0);
    } else if (rew === Gridworld.rewards.chocolate) {
      s.update(1);
    }

    this.params[s.x][s.y] = s.pr.alphas;
    this.paramQueue.push([s.x, s.y]);
    this.weights[s.y * this.size + s.x] = s.prob(1);
    this.weightQueue.push(s.y * this.size + s.x);
  }

  update(a: Action, e: Percept) {
    this.perform(a);
    this.bayesUpdate(a, e);
  }

  infoGain(): number {
    const stack: number[] = [];
    const s = this.pos;
    const ne = s.neighbors;
    let ig = 0;
    for (let i = 0; i < this.T; i++) {
      if (!(ne[i].constructor === DirichletTile)) {
        continue;
      }
      const idx = this.weightQueue.popBack();
      stack.push(idx);
      const p_ = this.weights[idx];
      const p = this.savedWeights[idx];
      if (p !== 0 && p_ !== 0) {
        ig += p_ * Math.log(p_) - p * Math.log(p);
      }
    }
    while (stack.length > 0) {
      const jdx = stack.pop() as number;
      this.weightQueue.push(jdx);
    }

    return ig;
  }

  entropy() {
    return util.entropy(this.weights);
  }

  save() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        for (let k = 0; k < this.T; k++) {
          this.savedParams[i][j][k] = this.params[i][j][k];
        }
      }
    }

    this.savedPos = {x: this.pos.x, y: this.pos.y};
    this.savedWeights = [...this.weights];
  }

  load() {
    this.pos = this.grid[this.savedPos.x][this.savedPos.y];
    while (!this.paramQueue.empty()) {
      const [i, j] = this.paramQueue.pop();
      for (let k = 0; k < this.T; k++) {
        this.params[i][j][k] = this.savedParams[i][j][k];
      }
      const t = this.grid[i][j];
      t.pr.alphas = this.params[i][j];
      t.pr.alphaSum = util.sum(t.pr.alphas);
    }

    while (!this.weightQueue.empty()) {
      const idx = this.weightQueue.pop();
      this.weights[idx] = this.savedWeights[idx];
    }
  }

  info() {
    return {};
  }
}

class DirichletTile extends Tile {
  /* Models a gridworld Tile. */

  children: Tile[];
  neighbors: DirichletTile[];
  pr: Dirichlet; //

  constructor(x: number, y: number) {
    super(x, y);
    this.children = [];
    this.children.push(new Tile(x, y));
    this.children.push(new Dispenser(x, y, 1));
    this.children.push(new Wall(x, y));
    this.children.push(new Trap(x, y));
    for (const child of this.children) {
      child.parent = this;
    }

    this.pr = new Dirichlet([0, 0, 0, 0]);
    this.neighbors = [];
  }

  sample() {
    const p = this.pr.means();
    const idx = util.sample(p);

    return this.children[idx];
  }

  update(symbol: number) {
    this.pr.update(symbol);
  }

  prob(symbol: number) {
    return this.pr.mean(symbol);
  }
}
