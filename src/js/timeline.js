// This js code does two things:
//      1. It highlights the active timeline-component. 
//      2. And it changes the graphic to show the appropriate data. 

var data = [];
$.getJSON("data/processed_buildings.json", function(json) {
    data = json;
});

function isCentered(obj) {
    var gridTop = 40;
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
        $('#timeline-graphic').removeClass(obj.id);
        markers.clearLayers();
    });
    $('.timeline-component').each(function(i, obj) {
        var every_other = ['original', '1900s', '1920s', '1940s', '1960s', '1980s', '2000s'];
        // var objs2 = ['1890s', '1910s', '1930s', '1950s', '1970s', '1990s', '2010s'];
        // var data1 = [{'lat': 37.871384, 'long': -122.258523, 'message': 'South Hall - Built 1873'}];
        // var data2 = [{'lat': 37.872557, 'long': -122.260949, 'message': 'Moffitt Library - Built 1970'}];

        if (isCentered(obj)) {
            if (every_other.indexOf(obj.id) >= 0) {
                // $('#timeline-graphic').css(
                //     {'background-image': 
                //     'url("http://bid.berkeley.edu/images/largemap.gif")'
                // });
                updateMapData(data);
            } else {
                // $('#timeline-graphic').css(
                //     {'background-image': 
                //     'url("http://www.ucmp.berkeley.edu/museum/vlsb_campusmap.gif")'
                // });
                var filtered = Object.keys(data).reduce(function (filtered, key) {
                    if (key != 'Lawrence Berkeley National Laboratory') filtered[key] = data[key];
                    return filtered;
                }, {});
                updateMapData(filtered);
            }
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

function updateMapData(data) {
    // for every line in the spreadsheet, add a point with the lat and long that has the pop message

    for (var key in data) {
        var value = data[key];
        console.log(value[1]);
        var polygon = L.polygon(value[1], {color: 'red', fill: true, stroke: false});
        polygon.bindPopup(key + ' - ' + value[0]);
        markers.addLayer(polygon);
        // map.fitBounds(polygon.getBounds());
    }

    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
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
