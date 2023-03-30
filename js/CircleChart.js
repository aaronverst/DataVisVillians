class CircleChart {
    constructor(selector, data) {
        this.selector = selector;
        this.data = data;
        this.radius = Math.min(400, 400) / 2;
        this.initVis();
        this.renderVis();
    }

    initVis() {
        this.color = d3.scaleOrdinal()
            .range(d3.schemeCategory10);

        this.svg = d3.select(this.selector)
            .append("svg")
            .attr("width", 400)
            .attr("height", 400)
            .append("g")
            .attr("transform", `translate(${this.radius}, ${this.radius})`);

        this.tooltip = d3.select(this.selector)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    renderVis() {
        const pie = d3.pie()
            .sort(null)
            .value(d => d.count);

        const arc = d3.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(0);

        const data = d3.group(this.data, d => d.agency_responsible);
        const keys = Array.from(data.keys());

        const color = this.color;
        const tooltip = this.tooltip;

        this.path = this.svg.selectAll("path")
            .data(pie(data.get(keys[0])))
            .join("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.count))
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.data.agency_responsible + "<br/>" + d.data.count)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        this.legend = this.svg.selectAll(".legend")
            .data(keys)
            .join("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${this.radius + 20}, ${-this.radius + i * 20})`);

        this.legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .style("fill", d => color(keys.indexOf(d)));

        this.legend.append("text")
            .attr("x", 12)
            .attr("y", 0)
            .text(d => d)
            .style("font-size", "12px");
    }
}

d3.tsv("data/June_August_data_2.tsv").then(data => {
    new CircleChart(".chart", data);
});