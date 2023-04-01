let _data, timeline, leafletMap;
let callFilter = [];
let weekNumber = [];
let count = 0;

d3.tsv('data/June_August_data_2.tsv')
    .then(data => {
        //console.log(data[0]);
        //console.log(data.length);
        data.forEach(d => {
            //console.log(d);
            _data = data;
            d.latitude = +d.latitude; //make sure these are not strings
            d.longitude = +d.longitude; //make sure these are not strings
            d.week_number = +d.week_number;
            //d.agency_responsible = +d.agency_responsible;
        });

        var publicAgency = d3.rollups(data, d => d.length, d => d.agency_responsible);
        weekNumber = d3.rollups(data, d => d.length, d => d.week_number);
        // Initialize chart and then show it

        leafletMap = new LeafletMap({ parentElement: '#my-map' }, data);
        timeline = new Timeline({ parentElement: '#timeline' }, data);
        weekdayBarchart = new WeekdayBarchart({ parentElement: '#weekdayBarchart' }, data);
        agencyBarchart = new agencyBarchart({ parentElement: '#agencyBarchart' }, data);
        wordcloud = new Wordcloud({ parentElement: '#wordcloud' }, data);

        // CircleChart = new CircleChart({ parentElement: '#circlechart' }, data);

        leafletMap.updateVis();
        timeline.updateVis();
        weekdayBarchart.updateVis();


        d3.select('#start-week-input').on('change', function () {
            // Get selected year
            const minWeek = parseInt(d3.select(this).property('value'));

            // Filter dataset accordingly
            let filteredData = weekNumber.filter(d => d[0] >= minWeek);

            // Update chart
            timeline.data = filteredData;

            timeline.updateVis();
        })


    })
    .catch(error => console.error(error));


function brushFilter() {
    if (callFilter.length == 0) {
        leafletMap.data = _data;
    }
    else {
        console.log(callFilter);
        leafletMap.data = _data.filter(d => callFilter.includes(d.week_number));
        console.log(callFilter);
    }
    leafletMap.updateVis();
}
