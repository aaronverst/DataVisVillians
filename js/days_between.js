class DaysBetween {
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
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || { top: 20, right: 40, bottom: 35, left: 55 },
            padding: _config.containerPadding || 10,
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

        vis.yScale = d3.scaleLog()
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
        .attr("transform", `translate(${vis.width/2},${vis.config.margin.top})`) // Center the text horizontally
        .attr("text-anchor", "middle") // Center the text horizontally
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold") // Make the text bold
        .text("Number of Days Between Initial Call and Updates - Log Scale");

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

        vis.xAxisG.append('text')
            .attr("transform", "translate(0,0)")
            .attr("y", vis.height - 410)
            .attr("x", vis.width - 600)
            .attr("font-size", "16px")
            .attr("stroke", "black")
            .text("Number of Days");

        vis.yAxisG.append('text')
            .attr("transform", "rotate(-90)")
            .attr("dy", "-13.5em")
            .attr("y", vis.height - 410)
            .attr("x", vis.width - 600)
            //.attr('float', 'left')
            .attr("font-size", "12px")
            .attr("stroke", "black")
            .text("Log Scale of Total Calls");

        let days_between = d3.rollups(vis.data, v => v.length, d => d.days_between);
        days_between.pop();
        console.log(days_between);

        vis.aggregatedData = Array.from(days_between, ([key, count]) => ({ key, count }));

        const orderedKeys = d3.range(1, 100);
        vis.aggregatedData = vis.aggregatedData.sort((a, b) => {
            return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
        });

        console.log(vis.aggregatedData);
        vis.xValue = d => d.key;
        // console.log(vis.data[0][1]);
        vis.yValue = d => d.count;

        vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
        vis.yScale.domain([0.5, d3.max(vis.aggregatedData, vis.yValue) + 500]);
        vis.renderVis();
    }

    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change 
     * (i.e., user selects a different year)
     */
    renderVis() {
        let vis = this;

        // Add rectangles
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData, d => d.days_between)
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
                d3.select('#tooltip5')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .style('opacity', 1)
                    // Format number with million and thousand separator
                    .html(`<div class="tooltip-title2">Days Between Call and Update - Log Scale</div><ul>${d3.format(',')(d.count)} </ul>`);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip5').style('display', 'none');
            })
            .on('click', function (event, d) {
                const isActive = daysFilter.includes(d.key);
                if (isActive) {
                   daysFilter = daysFilter.filter(f => f !== d.key); // Remove filter
                } else {
                    daysFilter.push(d.key); // Append filter
                }
                DaysFilter(); // Call global function to update scatter plot
                d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS
            });

        // Update the axes because the underlying scales might have changed
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
};
