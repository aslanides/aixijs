import * as d3 from "d3";
import { Gridworld, Dispenser, Tile } from "../environments/gridworld";
import { Agent } from "../agents/base";
import { Visualisation } from "./base";

type SVG = d3.Selection<any, any, any, any>
type Rectangle = d3.Selection<SVGRectElement, any, any, any>
type Circle = d3.Selection<SVGCircleElement, any, any, any>

export class GridVisualisation implements Visualisation {
	/* Visualisation for the Gridworld environment. */

	svg: SVG
	rectangles: Rectangle[][] = [];

	tileSize: number
	static minTileSizePx = 40

	static colors = {
		empty: '#fdfdfd',
		wall: 'grey',
		chocolate: 'yellow',
		dispenser: 'orange',
		agent: 'blue',
		trap: 'pink',
		rho: 'red',
		modifier: 'blue',
	};

	constructor(env: Gridworld) {

		// Get dimensions.		
		// Default size = 50% of min(screen width, screen height)
		const viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		const dim = 0.5 * Math.min(viewWidth, viewHeight);

		this.tileSize = Math.min(dim / env.size, GridVisualisation.minTileSizePx);
		const width = (this.tileSize + 1) * env.size - 1;
		const height = (this.tileSize + 1) * env.size - 1;

		d3.select('#gridvis').remove();

		// Create SVG
		this.svg = d3
			.select('#visualisations')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('id', 'gridvis')

		// Create grid of rectangles corresponding to each Tile.
		env.grid.forEach((row, idx) => {
			this.rectangles.push(new Array<Rectangle>(env.size));
			row.forEach((tile, jdx) => {
				const r = addTile(this.svg, tile, this.tileSize);
				this.rectangles[idx][jdx] = r;
			});
		});

		// Add the agent.
		this.svg
			.append('rect')
			// TODO(aslanides): fix!
			// .append('image')
			// .attr('xlink:href', 'assets/robot.svg')
			.attr('x', 0)
			.attr('y', 0)
			.attr('height', this.tileSize)
			.attr('width', this.tileSize)
			.attr('id', 'agent')
			.attr('fill', 'blue')
	}

	update(agent: Agent, env: Gridworld) {
		d3.select('#agent')
			.attr('x', env.pos.x * this.tileSize)
			.attr('y', env.pos.y * this.tileSize);
	}
}

function addCircle(svg: SVG, x: number, y: number, color: string, id: string, tileSize: number, radius?: number): Circle {
	const circle = svg.append('circle')
		.attr('cx', x * tileSize + tileSize / 2)
		.attr('cy', y * tileSize + tileSize / 2)
		.attr('r', radius ? (tileSize / 2) * radius : tileSize / 8)
		.attr('fill', color)
		.attr('stroke', '#000')
		.attr('id', id);
	return circle
}

function addTile(svg: SVG, t: Tile, size: number, color?: string): Rectangle {
	const rectangle = svg.append('rect')
		.attr('x', t.x * size)
		.attr('y', t.y * size)
		.attr('height', size)
		.attr('width', size)
		.attr('fill', color || t.color)
		.attr('stroke', 'black')
		.attr('stroke-width', 2);

	if (t.goal) {
		addCircle(svg, t.x, t.y, t.color, '', (t as Dispenser).freq);
	}

	return rectangle;
}
