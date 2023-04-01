let _data, timeline, leafletMap, zipcode;
let callFilter = [];
let weekNumber = [];
let zipcodeFilter = [];
let agencyFilter = [];
let count = 0;

d3.tsv('data/June_August_data_2.tsv')
    .then(data => {
        //console.log(data[0]);
        //console.log(data.length);
        data.forEach(d => {
            //console.log(d);
            _data = data;
            count += 1;
            d.latitude = +d.latitude; //make sure these are not strings
            d.longitude = +d.longitude; //make sure these are not strings
            d.week_number = +d.week_number;
            d.zipcode = +d.zipcode;
            //d.agency_responsible = +d.agency_responsible;
        });

        var publicAgency = d3.rollups(data, d => d.length, d => d.agency_responsible);
        weekNumber = d3.rollups(data, d => d.length, d => d.week_number);
        var serviceCode = d3.rollups(data, d => d.length, d => d.service_code);
        console.log(serviceCode);
        // Initialize chart and then show it

        leafletMap = new LeafletMap({ parentElement: '#my-map' }, data);
        timeline = new Timeline({ parentElement: '#timeline' }, data);
        let weekdayBarchart = new WeekdayBarchart({ parentElement: '#weekdayBarchart' }, data);
        agencyBarchart = new agencyBarchart({ parentElement: '#agencyBarchart' }, data);
        wordcloud = new Wordcloud({ parentElement: '#wordcloud' }, data);
        zipcode = new Zipcode({ parentElement: '#zipcode' }, data);

        // CircleChart = new CircleChart({ parentElement: '#circlechart' }, data);

        leafletMap.updateVis();
        timeline.updateVis();
        weekdayBarchart.updateVis();
        zipcode.updateVis();


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
        leafletMap.data = _data.filter(d => callFilter.includes(d.week_number));

    }
    leafletMap.updateVis();
}

function zipFilter() {
    if (zipcodeFilter.length == 0) {
        leafletMap.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
    }
    leafletMap.updateVis();
}

function AgencyFilter() {
    if (agencyFilter.length == 0) {
        leafletMap.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
    }
    leafletMap.updateVis();
}
