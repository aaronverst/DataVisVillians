// These are just placeholders 
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the SVG object to the div with id "timeline"
var svg = d3.select("#timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Read the data from the TSV file
d3.tsv("data/June_August_data.tsv", function (data) {

    // Group the data by week number and tally the service request IDs
    var groupedData = d3.group()
        .key(function (d) { return d.week_number; })
        .rollup(function (v) { return v.length; })
        .entries(data);

    // Define the x-axis scale
    var x = d3.scaleBand()
        .domain(groupedData.map(function (d) { return d.key; }))
        .range([0, width])
        .padding(0.1);

    // Define the y-axis scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, function (d) { return d.value; })])
        .range([height, 0]);

    // Add the bars to the chart
    svg.selectAll(".bar")
        .data(groupedData)
        .enter().append("rect")
        .attr("class", "bar")
        .style("fill", "steelblue")
        .attr("x", function (d) { return x(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.value); });

    // Add the x-axis to the chart
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y-axis to the chart
    svg.append("g")
        .call(d3.axisLeft(y));

});
