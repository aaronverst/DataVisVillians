d3.tsv('data/June_August_data.tsv')
    .then(data => {
        //console.log(data[0]);
        //console.log(data.length);
        data.forEach(d => {
            //console.log(d);
            d.latitude = +d.latitude; //make sure these are not strings
            d.longitude = +d.longitude; //make sure these are not strings
        });

        var publicAgency = d3.rollups(data, d => d.length, d => d.agency_responsible);
        console.log(publicAgency);
        // Initialize chart and then show it
        leafletMap = new LeafletMap({ parentElement: '#my-map' }, data);


    })
    .catch(error => console.error(error));