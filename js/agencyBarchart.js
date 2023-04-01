class LeafletMap {

    /**
     * Class constructor with basic configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        }
        this.data = _data;
        this.initVis();
    }

    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {

        let vis = this;

        //ESRI
        vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

        //TOPO
        vis.topoUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

        //Thunderforest Outdoors- requires key... so meh... 
        vis.thOutUrl = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';
        vis.thOutAttr = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        //Stamen Terrain
        vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
        vis.stAttr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        //Defining additional map backgrounds 
        var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });
        var Thunderforest_MobileAtlas = L.tileLayer('https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey={apikey}', {
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            apikey: '27d5774d815b4b54933de70941dd2b8f',
            maxZoom: 22
        });
        var Thunderforest_SpinalMap = L.tileLayer('https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey={apikey}', {
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            apikey: '27d5774d815b4b54933de70941dd2b8f',
            maxZoom: 22
        });
        var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        //this is the base map layer, where we are showing the map background
        vis.base_layer = L.tileLayer(vis.stUrl, {
            id: 'esri-image',
            attribution: vis.esriAttr,
            ext: 'png'
        });

        vis.zipcodeLayer = L.tileLayer()
        vis.theMap = L.map('my-map', {
            center: [39.15, -84.51],
            zoom: 12,
            minZoom: 7,
            maxZoom: 17,
            layers: [vis.base_layer]
        });

        //Defining map background names
        var baseMaps = {
            "Default Mode": vis.base_layer,
            "Major Roadways": Thunderforest_MobileAtlas,
            "Satellite View": Esri_WorldImagery,
            "Dark Mode": Stadia_AlidadeSmoothDark,
            "Super Dark Mode": Thunderforest_SpinalMap
        };

        //Implements map customization GUI
        var layerControl = L.control.layers(baseMaps).addTo(vis.theMap);
        //if you stopped here, you would just have a map

        //initialize svg for d3 to add to map
        L.svg({ clickable: true }).addTo(vis.theMap)// we have to make the svg layer clickable
        vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
        vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

        function nodeColor(color) {

            if (color.agency_responsible == "Public Services") {
                return 'yellow';
            }
            else if (color.agency_responsible == "Cinc Building Dept") {
                return 'orange';
            }
            else if (color.agency_responsible == "Police Department") {
                return 'steelblue';
            }
            else if (color.agency_responsible == "City Manager's Office") {
                return 'grey';
            }
            else if (color.agency_responsible == "Dept of Trans and Eng") {
                return 'green';
            }
            else if (color.agency_responsible == "Cinc Health Dept") {
                return '#EF5350';
            }
            else if (color.agency_responsible == "Cin Water Works") {
                return 'blue';
            }
            else if (color.agency_responsible == "Park Department") {
                return '#81C784';
            }
            else if (color.agency_responsible == "Fire Dept") {
                return '#B71C1C';
            }
            else if (color.agency_responsible == "Metropolitan Sewer") {
                return 'darkgreen'
            }
            else {
                return '#5E35B1';
            };
        };

        //handler here for updating the map, as you zoom in and out           
        vis.theMap.on("zoomend", function () {
            vis.updateVis();
        });

    }

    updateVis() {
        let vis = this;

        function nodeColor(color) {

            if (color.agency_responsible == "Public Services") {
                return 'yellow';
            }
            else if (color.agency_responsible == "Cinc Building Dept") {
                return 'orange';
            }
            else if (color.agency_responsible == "Police Department") {
                return 'steelblue';
            }
            else if (color.agency_responsible == "City Manager's Office") {
                return 'grey';
            }
            else if (color.agency_responsible == "Dept of Trans and Eng") {
                return 'green';
            }
            else if (color.agency_responsible == "Cinc Health Dept") {
                return '#EF5350';
            }
            else if (color.agency_responsible == "Cin Water Works") {
                return 'blue';
            }
            else if (color.agency_responsible == "Park Department") {
                return '#81C784';
            }
            else if (color.agency_responsible == "Fire Dept") {
                return '#B71C1C';
            }
            else if (color.agency_responsible == "Metropolitan Sewer") {
                return 'darkgreen'
            }
            else {
                return '#5E35B1';
            };
        };

        //want to see how zoomed in you are? 
        // console.log(vis.map.getZoom()); //how zoomed am I

        //want to control the size of the radius to be a certain number of meters? 
        vis.radiusSize = 3;

        // if( vis.theMap.getZoom > 15 ){
        //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
        //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
        //   radiusSize = desiredMetersForPoint / metresPerPixel;
        // }



        //redraw based on new zoom- need to recalculate on-screen position
        vis.Dots = vis.svg.selectAll('circle')
            .data(vis.data)
            .join('circle')
            .attr("fill", nodeColor)
            .attr("stroke", "black")
            //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
            //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
            //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
            .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
            .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
            .attr("r", vis.radiusSize)
            .on('mouseover', function (event, d) { //function to add mouseover event
                d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                    .duration('150') //how long we are transitioning between the two states (works like keyframes)
                    .attr("fill", "red") //change the fill
                    .attr('r', 4); //change radius

                //create a tool tip
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    // Format number with million and thousand separator
                    .html(`<div class="tooltip-label"><h3>Service ID: ${d.service_request_iD}</h3> <li>Call type: ${d.service_name} </li> 
                    <li>Request Date: ${d.requested_datetime}</li> <li> Updated Date: ${d.updated_datetime}</li> <li> Public agency: ${d.agency_responsible} </li>
                    <li> Description: ${d.description} </li> </div>`);

            })
            .on('mousemove', (event) => {
                //position the tooltip
                d3.select('#tooltip')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY + 10) + 'px');
            })
            .on('mouseleave', function () { //function to add mouseover event
                d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                    .duration('150') //how long we are transitioning between the two states (works like keyframes)
                    .attr("fill", nodeColor) //change the fill
                    .attr('r', 3) //change radius

                d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

            })

    }


    renderVis() {
        let vis = this;

        //not using right now... 

    }
}
