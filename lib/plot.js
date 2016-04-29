function drawPlot(trace,kind){
	//TODO add dynamic tooltip
	//http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

    var data = []
    if (kind == "average") {
        var i = 0
        data = trace.map(function(x) {i++;return x/i})
    } else {
        data = trace
    }

	var margin = {top: 50, right: 70, bottom: 30, left: 70}
	var width = 600 - margin.left - margin.right
    var height = 270 - margin.top - margin.bottom

	// Set the ranges
	var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d,i) { return x(i+1); })
	    .y(function(d) { return y(d); });

	// Adds the svg canvas
	var svg = d3.select(document.body)
	    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

	    // Scale the range of the data
	    x.domain(d3.extent(data, function(d, i) {return i+1}));
	    y.domain([0, d3.max(data, function(d) {return d})]);

	    // Add the valueline path.
	    svg.append("path")
	        .attr("class", "line")
	        .attr("d", valueline(data));

	    // Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis);

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis);

        svg.append("text")
            .attr("x",width/2)
            .attr("y",height + margin.bottom)
            .style("text-anchor","middle")
            .text("Cycles")

        svg.append("text")
            .attr("transform","rotate(-90)")
            .attr("x",0 - height/2)
            .attr("y",0 - margin.left)
            .attr("dy","1em")
            .style("text-anchor","middle")
            .text("Cycles")
}
