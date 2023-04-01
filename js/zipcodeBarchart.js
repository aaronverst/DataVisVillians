class Zipcode {
    /**
    * Class constructor with basic chart configuration
    * @param {Object}
    * @param {Array}
    */
    constructor(_config, _data) {
        // Configuration object with defaults
        // Important: depending on your vis and the type of interactivity you need
        // you might want to use getter and setter methods for individual attributes
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || { top: 20, right: 40, bottom: 35, left: 55 },
            tooltipPadding: _config.tooltipPadding || 15
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {

        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.15)
            .padding(0.2);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .scale(vis.yScale)
            .tickSizeOuter(0)
            .ticks(11);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.svg.append("text")
            .attr("transform", "translate(0,0)")
            .attr("x", 135)
            .attr("y", 10)
            .attr("font-size", "14px")
            .text("Number of 311 Calls made on each Weekday");

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);


        // Append y-axis group 
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')



        vis.updateVis();

        // Append titles, legends and other static elements here
        // ...
    }

    /**
     * This function contains all the code to prepare the data before we render it.
     * In some cases, you may not need this function but when you create more complex visualizations
     * you will probably want to organize your code in multiple functions.
     */
    updateVis() {
        let vis = this;

        // Set the scale input domains

        vis.xAxisG.selectAll('g')
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".4em")
            .attr("font-size", "9px")
            .attr("transform", "rotate(-30)");

        vis.xAxisG.append('text')
            .attr("transform", "translate(0,0)")
            .attr("y", vis.height - 194)
            .attr("x", vis.width - 65)
            .attr("font-size", "16px")
            .attr("stroke", "black")
            .text("Number of Calls Made");

        vis.yAxisG.append('text')
            .attr("transform", "rotate(-90)")
            .attr("dy", "-13.5em")
            .attr("y", vis.height - 125)
            .attr("x", vis.width - 160)
            .attr("font-size", "12px")
            .attr("stroke", "black")
            .text("Weekday");

        let zipcode = d3.rollups(vis.data, v => v.length, d => d.zipcode);
        zipcode.splice(29, 1)

        vis.aggregatedData = Array.from(zipcode, ([key, count]) => ({ key, count }));

        const orderedKeys = [45224, 45208, 45216, 45205, 45211, 45226, 45227, 45219, 45207, 45238, 45223, 45214, 45202, 45230, 45229, 45215, 45237, 45217, 45220, 45225, 45209, 45212, 45213, 45239,
            45232, 45206, 45233, 45204, 45203, 45288, 45231, 45221, 45236, 45140, 45252];
        vis.aggregatedData = vis.aggregatedData.sort((a, b) => {
            return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
        });
        vis.xValue = d => d.key;
        // console.log(vis.data[0][1]);
        vis.yValue = d => d.count;

        vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
        vis.yScale.domain([1, d3.max(vis.aggregatedData, vis.yValue) + 500]);
        vis.renderVis();
    }

    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change 
     * (i.e., user selects a different year)
     */
    renderVis() {
        let vis = this;

        vis.xAxisG.selectAll('g')
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".4em")
            .attr("font-size", "9px")
            .attr("transform", "rotate(-30)");

        // Add rectangles
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData, d => d.zipcode)
            .join('rect')
            .attr('class', 'bar')
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .style('opacity', 0.5)
            .style('opacity', 1)
            .style('fill', "#8AAC80")
            .on('mouseover', (event, d) => {
                d3.select('#tooltip3')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .style('opacity', 1)
                    // Format number with million and thousand separator
                    .html(`<div class="tooltip-title2">Number of Calls in Zipcode</div><ul>${d3.format(',')(d.count)} </ul>`);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip1').style('display', 'none');
            })
            .on('click', function (event, d) {
                const isActive = zipcodeFilter.includes(d.key);
                if (isActive) {
                    zipcodeFilter = zipcodeFilter.filter(f => f !== d.key); // Remove filter
                } else {
                    zipcodeFilter.push(d.key); // Append filter
                }
                zipFilter(); // Call global function to update scatter plot
                d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS
            });

        // Update the axes because the underlying scales might have changed
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
};
