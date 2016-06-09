class Plot{
	constructor(data,id,labels) {
		this.data = data
		this.x_label = labels.x
		this.y_label = labels.y
		this.value = labels.value

		this.margin = {top: 50, right: 70, bottom: 30, left: 70}
		this.width = 600 - this.margin.left - this.margin.right
		this.height = 270 - this.margin.top - this.margin.bottom

		this.x = d3.scale.linear().range([0, this.width]);
		this.y = d3.scale.linear().range([this.height, 0]);

		this.xAxis = d3.svg.axis().scale(this.x)
			.orient("bottom").ticks(5);

		this.yAxis = d3.svg.axis().scale(this.y)
			.orient("left").ticks(5);

		this.valueline = d3.svg.line()
			.x(function(d,i) { return this.x(i+1); })
			.y(function(d) { return this.y(d); });

		d3.select("#" + id).remove()
		this.svg = d3.select("#plots")
			.append("svg")
    		.attr("id",id)
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

		this.x.domain(d3.extent(this.data, (d,i) => i+1));
		this.y.domain([d3.min(this.data, d => d), d3.max(this.data, d => d)]);

		this.svg.append("path")
			.attr("class", "line")
			.attr("d", this.valueline(this.data));

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.xAxis);

		this.svg.append("g")
			.attr("class", "y axis")
			.call(this.yAxis);

		this.svg.append("text")
			.attr("x",this.width/2)
			.attr("y",this.height + this.margin.bottom)
			.style("text-anchor","middle")
			.text(this.x_label)

		this.svg.append("text")
			.attr("transform","rotate(-90)")
			.attr("x",0 - this.height/2)
			.attr("y",0 - this.margin.left)
			.attr("dy","1em")
			.style("text-anchor","middle")
			.text(this.y_label)
	}
	static clearAll() {
		var plots = d3.select("#plots")[0][0]
		while (plots.children.length > 0) {
			d3.select("#" + plots.children[0].id).remove()
		}
	}
}

class TooltipPlot extends Plot {
	constructor(data,id,labels) {
		super(data,id,labels)
		this.tooltip = this.svg.append("g").style("display", "none");

		this.tooltip.append("circle")
			 .attr("class", "y")
			 .style("fill", "none")
			 .style("stroke", "grey")
			 .attr("r", 4);

    	this.tooltip.append("text")
        	.attr("class", "y1")
        	.style("stroke", "white")
        	.style("stroke-width", "3.5px")
        	.style("opacity", 0.8)
        	.attr("dx", 8)
        	.attr("dy", "-.3em");
    	this.tooltip.append("text")
        	.attr("class", "y2")
        	.attr("dx", 8)
        	.attr("dy", "-.3em");
    	this.tooltip.append("text")
        	.attr("class", "y3")
        	.style("stroke", "white")
        	.style("stroke-width", "3.5px")
        	.style("opacity", 0.8)
        	.attr("dx", 8)
        	.attr("dy", "1em");
    	this.tooltip.append("text")
        	.attr("class", "y4")
        	.attr("dx", 8)
        	.attr("dy", "1em")
	}
	updatePlot(time){
		var y_val = Util.roundTo(this.data[time], 4)
		this.tooltip.select("circle.y")
			.attr("transform",
			"translate(" + this.x(time) + "," +
			this.y(y_val) + ")");

		this.tooltip.style("display", null);

		for (var i=1;i<5;i++) {
			var text = "t: " + time
			if (i==2) {
				text = this.value + ": " + y_val
			}
			this.tooltip.select("text.y" + i)
				.attr("transform",
				"translate(" + this.x(time)
				+ "," + this.y(y_val) + ")")
				.text(text)
		}
	}
}

class RewardPlot extends TooltipPlot {
	constructor(trace) {
        var i = 0
        var data = trace.map(function(x) {i++;return x/i})
		super(data,"reward_plot",{x:"Cycles",y:"Average reward",value:"rew"})
	}
}

class IGPlot extends TooltipPlot {
	constructor(trace) {
		super(trace,"ig_plot",{x:"Cycles",y:"Information gain",value:"IG"})
	}
}
