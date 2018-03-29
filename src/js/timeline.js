// This js code does two things:
//      1. It highlights the active timeline-component. 
//      2. And it changes the graphic to show the appropriate data. 

require('../data/shapes.json');
require('../data/building_years.json');

var shape_data = [];
$.getJSON("data/shapes.json", function(json) {
    shape_data = json;
});

var year_data = [];
$.getJSON("data/building_years.json", function(json) {
    year_data = json;
});

function isCentered(obj) {
    var gridTop = 20;
    var thisTop = $(obj).offset().top - $(window).scrollTop() - $('#timeline-graphic').height();

    // var gridBottom = $(window).height() * 1.0;
    // var centered = (thisTop >= gridTop && (thisTop + $(obj).height()) <= gridBottom);

    var centered = thisTop >= gridTop;
    return centered;
}

function highlight() {
    $('.timeline-component').each(function(i, obj) {
        obj.classList.remove('active-timeline-component');
    });
    $('.timeline-component').each(function(i, obj) {
        if (isCentered(obj)) {
            obj.classList.add('active-timeline-component');
            return false;
        }
    });
}

function updateGraphic() {
    $('.timeline-component').each(function(i, obj) {
        var every_other = ['original', '1900s', '1920s', '1940s', '1960s', '1980s', '2000s'];
        // var objs2 = ['1890s', '1910s', '1930s', '1950s', '1970s', '1990s', '2010s'];
        // var data1 = [{'lat': 37.871384, 'long': -122.258523, 'message': 'South Hall - Built 1873'}];
        // var data2 = [{'lat': 37.872557, 'long': -122.260949, 'message': 'Moffitt Library - Built 1970'}];

        if (isCentered(obj)) {
            $('.timeline-component').each(function(i, obj) {
                $('#timeline-graphic').removeClass(obj.id);
                markers.clearLayers();
            });
            updateMapData(obj.id);
            return false;
        }
    });
}

// Now for the map code
require('../scss/main.scss');
// const map_data = require('../data/data.json'); //loading in data.json as a data variable in js
const L = require('leaflet');
const MC = require('leaflet.markercluster')

var map = L.map('timeline-graphic', { scrollWheelZoom:false })
            .setView([37.871470, -122.260363], 15); //'map' refers to map id

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Clustering
// var markers = L.markerClusterGroup({
//     iconCreateFunction: function(cluster) {
//       var markers = cluster.getAllChildMarkers();
//       var html = '<div class="circle">' + markers.length + '</div>';
//       return L.divIcon({ html: html, className: 'mycluster', iconSize: L.point(32, 32) });
//     },
//     // To disable clustering for now
//     maxClusterRadius: 0
// });

var markers = new L.featureGroup();

function getColor(highlightedSection, row) {
    var built = parseInt(row['Built']);
    var built10 = Math.floor(built / 10) * 10;
    var sectYear = highlightedSection;

    if (row['Razed']) {
        var razed = parseInt(row['Razed']);
        var razed10 = Math.floor(razed / 10) * 10;
    }

    var builtColor = 'green';
    var razedColor = 'red';
    var existedColor = 'black';

    if (sectYear == 1873) {
        if (built == 1873) {
            return builtColor
        } else {
            return null;
        }
    }
    
    if (sectYear == built10) {
        return builtColor
    } else if ((sectYear > built10 && razed == null) || (sectYear < razed10 && sectYear > built10)) {
        return existedColor
    } else if (razed != null && sectYear == razed10) {
        return razedColor
    } else {
        return null
    }
}

function updateMapData(highlightedSection) {
    // for every line in the spreadsheet, add a point with the lat and long that has the pop message

    var missingShapes = []
    var includedShapes = []

    for (var row in year_data) {
        var name = year_data[row]['Building Name'];
        var built = year_data[row]['Built'];
        var razed = year_data[row]['Razed'];
        // console.log(row);
        // console.log(shape_data)
        if (name in shape_data) {
            var value = shape_data[name];
            // console.log(value[1]);
            var buildingColor = getColor(highlightedSection, year_data[row]);
            // console.log(namebuildingColor);
            if (buildingColor != null) {
                var polygon = L.polygon(value[1], {
                    color: buildingColor, 
                    fillOpacity: 0.5, 
                    fill: true, 
                    stroke: false
                });
                polygon.bindPopup(name);
                markers.addLayer(polygon);
            }
            includedShapes.push(name);
        } else {
            missingShapes.push(name);
        }
        console.log(missingShapes)
        console.log(includedShapes)
    }

    map.addLayer(markers);
    if (markers.getBounds()['_northEast']) {
        map.fitBounds(markers.getBounds());
    }
}

$(document).ready(function() {

    highlight();
    $(window).on('scroll', highlight);
    $(window).on('resize', highlight);

    updateGraphic();
    $(window).on('scroll', updateGraphic);
    $(window).on('resize', updateGraphic);

    // $('#timeline-graphic').on('click', updateGraphic);
});
