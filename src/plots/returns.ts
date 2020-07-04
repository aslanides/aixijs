import * as d3 from "d3";
import { Plot } from "./base";


export interface Result {
  step: number;
  return: number;
}

export class ReturnPlot implements Plot {

  line: d3.Line<Result>;
  svg: d3.Selection<any, any, any, any>;

  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;

  xLim: [number, number];
  yLim: [number, number];

  height = 500;
  width = 500;
  margin = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
  };

  xAxis: d3.Axis<any>;
  yAxis: d3.Axis<any>;
  path: any;

  xAxisLabel: d3.Selection<any, any, any, any>;
  yAxisLabel: d3.Selection<any, any, any, any>;

  constructor() {
    // Plot dimensions.

    this.width -= (this.margin.left + this.margin.right);
    this.height -= (this.margin.top + this.margin.bottom);

    // Create x scale.
    this.xLim = [0, 0];
    this.yLim = [0, 0];
    this.xScale = d3
      .scaleLinear()
      .domain(this.xLim)
      .range([this.margin.left, this.width - this.margin.right]);

    // Create y scale.
    this.yScale = d3
      .scaleLinear()
      .domain(this.yLim)
      .range([this.height - this.margin.bottom, this.margin.top]);

    // Geometry.
    this.line = d3
      .line<Result>()
      .x(d => this.xScale(d.step))
      .y(d => this.yScale(d.return));

    this.svg = d3.select('#plots')
      .append('svg')
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('id', 'return_plot');
    this.clear();
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisLeft(this.yScale).ticks(5);
    this.xAxisLabel = this.svg.append('g')
      .attr('class', 'x axis');
    this.yAxisLabel = this.svg.append('g')
      .attr('class', 'y axis');
  }

  update(results: Result[]): void {
    // Update limits.
    this.updateLimits(results[results.length - 1]);
    this.xScale.domain(this.xLim);
    this.yScale.domain(this.yLim);

    this.path.attr('d', this.line(results));  // Probably O(N). Fix this with join() nonsense.

    this.yAxisLabel.call(this.yAxis);
    this.xAxisLabel.call(this.xAxis);

  }

  clear() {
    this.xLim = [0, 0];
    this.yLim = [0, 0];
    this.svg.selectAll('*').remove();
    (document.getElementById('return_plot') as HTMLDivElement).remove();
    this.svg = d3.select('#plots')
      .append('svg')
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('id', 'return_plot');
    this.path = this.svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);
    this.xAxisLabel = this.svg.append('g')
      .attr('class', 'x axis');
    this.yAxisLabel = this.svg.append('g')
      .attr('class', 'y axis');

  }

  private updateLimits(result: Result) {
    if (result.step > this.xLim[1]) {
      this.xLim[1] = result.step;
    }

    if (result.step < this.xLim[0]) {
      this.xLim[0] = result.step;
    }

    if (result.return > this.yLim[1]) {
      this.yLim[1] = result.return;
    }

    if (result.return < this.yLim[0]) {
      this.yLim[0] = result.return;
    }
  }
}