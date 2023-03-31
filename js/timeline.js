class Timeline {

    /**
    * Class constructor with basic configuration
    * @param {Object}
    * @param {Array}
    */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            width: 800,
            height: 300,
            margin: { top: 30, right: 10, bottom: 105, left: 70 },
            tooltipPadding: _config.tooltipPadding || 15,
            contextHeight: 45,
            contextMargin: { top: 350, right: 10, bottom: 40, left: 45 }
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {

        let vis = this;
        //vis.data.sort();

        // These are just placeholders 

        const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
        const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

        // Define the x-axis scale
        vis.xScaleFocus = d3.scaleTime()
            .range([0, vis.config.width])


        vis.xScaleContext = d3.scaleTime()
            .range([0, vis.config.width]);

        vis.yScaleFocus = d3.scaleLinear()
            .range([vis.config.height, 0])
            .nice();

        vis.yScaleContext = d3.scaleLinear()
            .range([vis.config.contextHeight, 0])
            .nice();

        vis.xAxisFocus = d3.axisBottom(vis.xScaleFocus).tickSizeOuter(0).tickFormat(d3.format("d"));
        vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0).tickFormat(d3.format("d"));
        vis.yAxisFocus = d3.axisLeft(vis.yScaleFocus);

        vis.svg = d3.select(vis.config.parentElement)
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        vis.svg.append("text")
            .attr("transform", "translate(0,0)")
            .attr("x", 240)
            .attr("y", 11)
            .attr("font-size", "14px")
            .text("Number of Calls Made According to Week Number (June through August)");

        vis.focus = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.focus.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);

        vis.focusLinePath = vis.focus.append('path')
            .attr('class', 'chart-line')
            .style('stroke', '#8AAC80');

        vis.xAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.height})`);

        vis.yAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis y-axis');

        vis.tooltipTrackingArea = vis.focus.append('rect')
            .attr('width', vis.config.width)
            .attr('height', vis.config.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        // Empty tooltip group (hidden by default)
        vis.tooltip = vis.focus.append('g')
            .attr('class', 'tooltip2')
            .style('display', 'none');

        vis.tooltip.append('circle')
            .attr('r', 4);

        vis.tooltip.append('text');

        // 
        // Append context group with x- and y-axes
        vis.context = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`);

        vis.contextAreaPath = vis.context.append('path')
            .attr('class', 'chart-area');

        vis.xAxisContextG = vis.context.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.contextHeight})`);

        vis.brushG = vis.context.append('g')
            .attr('class', 'brush x-brush');

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
            .on('brush', function ({ selection }) {
                if (selection) vis.brushed(selection);
            })
            .on('end', function ({ selection }) {
                if (!selection) vis.brushed(null);
            });

        vis.updateVis();

    };

    updateVis() {
        let vis = this;

        vis.xAxisFocusG.append('text')
            .attr("transform", "translate(0,0)")
            .attr("y", vis.config.height - 202)
            .attr("x", vis.config.width - 400)
            .attr("font-size", "12px")
            .attr("stroke", "black")
            .text("Week Number");


        vis.yAxisFocusG.append('text')
            .attr("transform", "rotate(-90)")
            .attr("dy", "-13.5em")
            .attr("y", vis.config.height - 200)
            .attr("x", vis.config.width - 860)
            .attr("font-size", "12px")
            .attr("stroke", "black")
            .text("Number of Service Calls")


        const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.week_number);

        vis.aggregatedData = aggregatedDataMap;
        vis.aggregatedData.sort();

        // const orderedKeys = ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'];
        // vis.aggregatedData = vis.aggregatedData.sort((a, b) => {
        //     return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
        // });

        console.log(vis.aggregatedData);

        vis.xValue = d => d[0];
        vis.yValue = d => d[1];

        vis.line = d3.line()
            .x(d => vis.xScaleFocus(vis.xValue(d)))
            .y(d => vis.yScaleFocus(vis.yValue(d)));

        vis.area = d3.area()
            .x(d => vis.xScaleContext(vis.xValue(d)))
            .y1(d => vis.yScaleContext(vis.yValue(d)))
            .y0(vis.config.contextHeight);

        // Set the scale input domains
        vis.xScaleFocus.domain(d3.extent(vis.aggregatedData, vis.xValue));
        vis.yScaleFocus.domain(d3.extent(vis.aggregatedData, vis.yValue));
        vis.xScaleContext.domain(vis.xScaleFocus.domain());
        vis.yScaleContext.domain(vis.yScaleFocus.domain());
        vis.bisectDate = d3.bisector(vis.xValue).left;

        vis.renderVis();

    };

    renderVis() {

        let vis = this;

        vis.xValue = d => d[0];
        vis.yValue = d => d[1];

        vis.focusLinePath
            .datum(vis.aggregatedData)
            .attr('d', vis.line);

        vis.contextAreaPath
            .datum(vis.aggregatedData)
            .attr('d', vis.area);


        vis.tooltipTrackingArea
            .on('mouseenter', () => {
                vis.tooltip.style('display', 'block');
            })
            .on('mouseleave', () => {
                vis.tooltip.style('display', 'none');
            })
            .on('mousemove', function (event) {
                // Get date that corresponds to current mouse x-coordinate
                const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
                const date = vis.xScaleFocus.invert(xPos);

                // Find nearest data point
                const index = vis.bisectDate(vis.aggregatedData, date, 1);
                const a = vis.aggregatedData[index - 1];
                const b = vis.aggregatedData[index];
                const d = b && (date - a[0] > b[0] - date) ? b : a;

                // Update tooltip
                vis.tooltip.select('circle')
                    .attr('transform', `translate(${vis.xScaleFocus(d[0])},${vis.yScaleFocus(d[1])})`);

                vis.tooltip.select('text')
                    .attr('transform', `translate(${vis.xScaleFocus(d[0])},${(vis.yScaleFocus(d[1]) - 15)})`)
                    .text(Math.round(d[1]));
            })

        // vis.brushG
        //     .data(vis.aggregatedData)
        //     .on('click', function (event, d) {
        //         let value = arrayToObject(vis.aggregatedData, aggregatedDataMap);
        //         console.log(value);
        //         const isActive = callFilter.includes(value.key);
        //         if (isActive) {
        //             callFilter = callFilter.filter(f => f !== (value.key)); // Remove filter
        //         } else {
        //             callFilter.push(value.key); // Append filter
        //         }
        //         brushFilter(); // Call global function to update scatter plot
        //         d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS
        //     });


        // Update the axes
        vis.xAxisFocusG.call(vis.xAxisFocus);
        vis.yAxisFocusG.call(vis.yAxisFocus);
        vis.xAxisContextG.call(vis.xAxisContext);

        const defaultBrushSelection = [vis.xScaleFocus(new Date(23)), vis.xScaleContext.range()[1]];
        vis.brushG
            .call(vis.brush)
            .call(vis.brush.move, defaultBrushSelection);

    }

    brushed(selection) {
        let vis = this;
        const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.week_number);

        // Check if the brush is still active or if it has been removed
        if (selection) {
            const selectedDomain = selection.map(vis.xScaleContext.invert, vis.xScaleContext);
            // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
            let value = arrayToObject(vis.aggregatedData, aggregatedDataMap);
            console.log(value);
            const isActive = callFilter.includes(value.key);
            if (isActive) {
                callFilter = callFilter.filter(f => f !== (value.key)); // Remove filter
            } else {
                callFilter.push(value.key); // Append filter
            }
            brushFilter(); // Call global function to update scatter plot
            //d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS

            // Update x-scale of the focus view accordingly
            vis.xScaleFocus.domain(selectedDomain);
        } else {
            // Reset x-scale of the focus view (full time period)
            vis.xScaleFocus.domain(vis.xScaleContext.domain());
        }

        // Redraw line and update x-axis labels in focus view
        vis.focusLinePath.attr('d', vis.line);
        vis.xAxisFocusG.call(vis.xAxisFocus);
    }
};

function arrayToObject(dataMap, data) {

    dataMap = Array.from(data, ([key, count]) => ({ key, count }));

    const orderedKeys = ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'];
    dataMap = dataMap.sort((a, b) => {
        return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
    });
    console.log(dataMap);
    return dataMap;
}
