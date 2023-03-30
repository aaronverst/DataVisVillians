d3.tsv('data/June_August_data_2.tsv')
    .then(data => {
        //console.log(data[0]);
        //console.log(data.length);
        data.forEach(d => {
            //console.log(d);
            d.latitude = +d.latitude; //make sure these are not strings
            d.longitude = +d.longitude; //make sure these are not strings
            d.week_number = +d.week_number;
        });

        var publicAgency = d3.rollups(data, d => d.length, d => d.agency_responsible);
        var weekNumber = d3.rollups(data, d => d.length, d => d.week_number);
        console.log(publicAgency);
        // Initialize chart and then show it
        leafletMap = new LeafletMap({ parentElement: '#my-map' }, data);
        timeline = new Timeline({ parentElement: '#timeline'}, weekNumber);

        timeline.updateVis();


        d3.select('#start-week-input').on('change', function() {
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
