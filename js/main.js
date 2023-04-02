let _data, data, timeline, leafletMap, zipcode, serviceBarchart, daysBetween, weekdayBarchart;
let callFilter = [];
let weekNumber = [];
let zipcodeFilter = [];
let agencyFilter = [];
let serviceFilter = [];
let daysFilter = [];
let weekdayFilter = [];
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
            d.days_between = +d.days_between;
        });

        var publicAgency = d3.rollups(data, d => d.length, d => d.agency_responsible);
        weekNumber = d3.rollups(data, d => d.length, d => d.week_number);
        var serviceCode = d3.rollups(data, d => d.length, d => d.service_code);

        for (let i = 0; i < data.length; i++) {
            if (data[i].agency_responsible != "Public Services" && data[i].agency_responsible != "Cinc Building Dept"
                && data[i].agency_responsible != "City Manager's Office" && data[i].agency_responsible != "Police Department"
                && data[i].agency_responsible != "Cinc Health Dept" && data[i].agency_responsible != "Park Department"
                && data[i].agency_responsible != "Cin Water Works" && data[i].agency_responsible != "Fire Dept"
                && data[i].agency_responsible != "Metropolitan Sewer" && data[i].agency_responsible != "Dept of Trans and Eng") {
                data[i].agency_responsible = "Other";
            };
        };

        for (let i = 0; i < data.length; i++) {
            if (data[i].service_code != '"STRSGN"' && data[i].service_code != '"LITR-PRV"'
                && data[i].service_code != '"TLGR-PRV"' && data[i].service_code != '"MTL-FRN"'
                && data[i].service_code != '"DFLTPLC"' && data[i].service_code != '"TGGDCLLC"'
                && data[i].service_code != '"TRASH-I"' && data[i].service_code != '"DAPUB1"'
                && data[i].service_code != '"PLMB_DEF"' && data[i].service_code != '"TRSHCRTR"'
                && data[i].service_code != '"RCYCLNG"' && data[i].service_code != '"BLD-RES"'
                && data[i].service_code != '"RF-COLLT"' && data[i].service_code != '"YDWSTA-J"'
                && data[i].service_code != '"REPAIR96"' && data[i].service_code != '"YRDWSTTC"'
                && data[i].service_code != '"TIRES"' && data[i].service_code != '"TRREPR"'
                && data[i].service_code != '"NCRHMNT"' && data[i].service_code != '"DFLTCITY"'
                && data[i].service_code != '"MOLD"' && data[i].service_code != '"PTHOLE"'
                && data[i].service_code != 'PRKNGYRD' && data[i].service_code != '"SVCCMPLT"'
                && data[i].service_code != '"CRNRCNOF"' && data[i].service_code != '"DUMP-PVS"') {
                data[i].service_code = 'Other';
            };
        };
        // Initialize chart and then show it

        leafletMap = new LeafletMap({ parentElement: '#my-map' }, data);
        timeline = new Timeline({ parentElement: '#timeline' }, data);
        weekdayBarchart = new WeekdayBarchart({ parentElement: '#weekdayBarchart' }, data);
        agencyBarchart = new agencyBarchart({ parentElement: '#agencyBarchart' }, data);
        //wordcloud = new Wordcloud({ parentElement: '#wordcloud' }, data);
        zipcode = new Zipcode({ parentElement: '#zipcode' }, data);
        serviceBarchart = new ServiceBarchart({parentElement: '#serviceBarchart' }, data);
        daysBetween = new DaysBetween({parentElement: '#days_between' }, data);

        // CircleChart = new CircleChart({ parentElement: '#circlechart' }, data);

        leafletMap.updateVis();
        timeline.updateVis();
        weekdayBarchart.updateVis();
        agencyBarchart.updateVis();
        zipcode.updateVis();
        serviceBarchart.updateVis();
        daysBetween.updateVis();


        d3.select('#start-week-input').on('change', function () {
            // Get selected year
            const minWeek = parseInt(d3.select(this).property('value'));

            // Filter dataset accordingly
            let filteredData = weekNumber.filter(d => d[0] >= minWeek);

            // Update chart
            timeline.data = filteredData;

            timeline.updateVis();
        })
        
        _data = data;
    })
    .catch(error => console.error(error));

_data = data;

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
        agencyBarchart.data = _data;
        weekdayBarchart.data = _data;
        serviceBarchart.data = _data;
        daysBetween.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
        agencyBarchart.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
        weekdayBarchart.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
        serviceBarchart.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
        daysBetween.data = _data.filter(d => zipcodeFilter.includes(d.zipcode));
    }
    leafletMap.updateVis();
    agencyBarchart.updateVis();
    weekdayBarchart.updateVis();
    serviceBarchart.updateVis();
    daysBetween.updateVis();
}

function AgencyFilter() {
    if (agencyFilter.length == 0) {
        leafletMap.data = _data;
        zipcode.data = _data;
        weekdayBarchart.data = _data;
        serviceBarchart.data = _data;
        daysBetween.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
        zipcode.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
        weekdayBarchart.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
        serviceBarchart.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
        daysBetween.data = _data.filter(d => agencyFilter.includes(d.agency_responsible));
    }
    leafletMap.updateVis();
    zipcode.updateVis();
    weekdayBarchart.updateVis();
    serviceBarchart.updateVis();
    daysBetween.updateVis();
}

function ServiceFilter() {
    if (serviceFilter.length == 0) {
        leafletMap.data = _data;
        agencyBarchart.data = _data;
        weekdayBarchart.data = _data;
        zipcode.data = _data;
        daysBetween.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => serviceFilter.includes(d.service_code));
        agencyBarchart.data = _data.filter(d => serviceFilter.includes(d.service_code));
        weekdayBarchart.data = _data.filter(d => serviceFilter.includes(d.service_code));
        zipcode.data = _data.filter(d => serviceFilter.includes(d.service_code));
        daysBetween.data = _data.filter(d => serviceFilter.includes(d.service_code));
    }
    leafletMap.updateVis();
    agencyBarchart.updateVis();
    weekdayBarchart.updateVis();
    zipcode.updateVis();
    daysBetween.updateVis();
}

function DaysFilter() {
    if (daysFilter.length == 0) {
        leafletMap.data = _data;
        agencyBarchart.data = _data;
        weekdayBarchart.data = _data;
        zipcode.data = _data;
        serviceBarchart.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => daysFilter.includes(d.days_between));
        agencyBarchart.data = _data.filter(d => daysFilter.includes(d.days_between));
        weekdayBarchart.data = _data.filter(d => daysFilter.includes(d.days_between));
        zipcode.data = _data.filter(d => daysFilter.includes(d.days_between));
        serviceBarchart.data = _data.filter(d => daysFilter.includes(d.days_between));
    }
    leafletMap.updateVis();
    agencyBarchart.updateVis();
    weekdayBarchart.updateVis();
    zipcode.updateVis();
    serviceBarchart.updateVis();
}

function WeekdayFilter() {
    if (weekdayFilter.length == 0) {
        leafletMap.data = _data;
        agencyBarchart.data = _data;
        daysBetween.data = _data;
        zipcode.data = _data;
        serviceBarchart.data = _data;
    }
    else {
        leafletMap.data = _data.filter(d => weekdayFilter.includes(d.weekday));
        agencyBarchart.data = _data.filter(d => weekdayFilter.includes(d.weekday));
        daysBetween.data = _data.filter(d => weekdayFilter.includes(d.weekday));
        zipcode.data = _data.filter(d => weekdayFilter.includes(d.weekday));
        serviceBarchart.data = _data.filter(d => weekdayFilter.includes(d.weekday));
    }
    leafletMap.updateVis();
    agencyBarchart.updateVis();
    daysBetween.updateVis();
    zipcode.updateVis();
    serviceBarchart.updateVis();
}
