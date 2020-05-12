const planePath = 'M406.948 45.65c-27.904 38.297-57.447 79.104-85.135 117.442-86.405 0.583-170.711-1.485-257.106-1.085-7.045 9.799-14.131 19.6-21.207 29.369 71.414 18.535 142.786 37.059 214.19 55.593-23.296 31.222-44.329 64.123-57.231 102.82-38.922 1.464-78.059 3.134-117.013 4.782-4.362 5.837-8.745 11.868-12.912 17.93 35.819 12.278 77.875 15.175 113.684 27.269 22.282 31.017 27.269 66.837 49.552 97.628 4.567-4.598 18.514-15.596 23.091-20.224-10.608-37.663-19.774-64.103-30.403-101.775 33.526-27.269 60.16-59.341 80.158-96.615 37.673 60.631 75.151 120.976 112.834 181.545 6.656-7.906 13.538-15.596 20.194-23.317-26.010-79.524-52.050-159.027-78.049-238.776 42.67-57.252 118.866-121.579 105.339-183.613-22.507-0.809-43.755 12.083-59.986 31.027z'

var width = 1200,
    height = 900;

var proj = d3.geoOrthographic()
    .scale(430)
    .translate([width / 2, height / 2])
    // change this to 180 for transparent globe
    .clipAngle(90);


var path = d3.geoPath().projection(proj).pointRadius(1.5);

var graticule = d3.geoGraticule();

var Israel = [34.885433, 32.005650];

var time = Date.now();
var rotate = [39.666666666666664, -30];
var velocity = [.015, -0];

var lineToIsrael = function (d) {
    return path({ 'type': 'LineString', 'coordinates': [Israel, [d.long, d.lat]] });
}

function stripWhitespace(str) {
    return str.replace(' ', '');
}

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)

svg.call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged));

queue()
    .defer(d3.json, 'json/world.json')
    .defer(d3.json, 'json/routes.json')
    .await(ready);

function ready(error, world, data) {

    const globe = svg.append('g').attr('class', 'globe')

    globe.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', proj.scale())
        .attr('class', 'noclicks')
        .attr('fill', 'none');


    globe.append('g')
        .attr('class', 'landcontainer')
        .append('path')
        .datum(topojson.object(world, world.objects.land))
        .attr('class', 'land')
        .attr('d', path);

    // svg.append('path')
    //     .datum(graticule)
    //     .attr('class', 'graticule noclicks')
    //     .attr('d', path);

    // svg.append('g')
    // .attr('class', 'points')
    //     .selectAll('text')
    //     .data(data.routes)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'point')
    //     .attr('d', path);

    // svg.append('g')
    //     .attr('class', 'planes')
    //     .append('path')
    //     .attr('class', 'plane')
    //     .attr('d', planePath)
    //     .append('animateMotion')
    //     .attr('dur', '8s')
    //     .attr('repeatCount', 'indefinite')
    //     .append('mpath')
    //     .attr('xlink:href', 'newyork')


    svg.append('g')
        .attr('class', 'lines')
        .selectAll('text')
        .data(data.routes)
        .enter()
        .append('path')
        .attr('class', 'lines')
        .attr('id', d => stripWhitespace(d.destination))
        .attr('d', d => lineToIsrael(d));


    svg.append('g').attr('class', 'labels')
        .selectAll('text')
        .data(data.routes)
        .enter()
        .append('text')
        .attr('class', 'label')
        .text(d => d.destination)
        .on('mouseover', (d) => {
            // var distance = Math.round(d3.geoDistance(d.geometry.coordinates, Israel) * 6371);
            // d3.select('g.info').select('text.distance').text('Distance from Israel: ~' + distance + 'km');
            var name = stripWhitespace(d.destination);
            d3.select('g.lines').select('#' + name).style('stroke-opacity', 1)
        })
        .on('mouseout', (d) => {
            var name = stripWhitespace(d.destination);
            d3.select('g.lines').select('#' + name).style('stroke-opacity', 0.3)
            // d3.select('g.info').select('text.distance').text('Distance from Israel: Hover Over A Location');
        });

    globe.append('g').attr('class', 'countries')
        .selectAll('path')
        .data(topojson.object(world, world.objects.countries).geometries)
        .enter()
        .append('path')
        .attr('d', path);

    position_labels();

    refresh();

    spin();
}


function position_labels() {
    var centerPos = proj.invert([width / 2, height / 2]);

    svg.selectAll('.label')
        .attr('text-anchor', (d) => {
            var x = proj([d.long, d.lat])[0];
            return x < width / 2 - 20 ? 'end' :
                x < width / 2 + 20 ? 'middle' :
                    'start'
        })
        .attr('transform', (d) => {
            var loc = proj([d.long, d.lat]),
                x = loc[0],
                y = loc[1];
            var offset = x < width / 2 ? -5 : 5;
            return 'translate(' + (x + offset) + ',' + (y - 2) + ')'
        })
        .style('display', (d) => {
            var d = d3.geoDistance([d.long, d.lat], centerPos);
            return (d > 1.57) ? 'none' : 'inline';
        })

}

function refresh() {
    svg.selectAll('.land').attr('d', path);
    svg.selectAll('.countries path').attr('d', path);
    svg.selectAll('.graticule').attr('d', path);
    svg.selectAll('.point').attr('d', path);
    svg.selectAll('.lines').attr('d', (d) => { if (d) { return lineToIsrael(d); } });
    position_labels();
}


var timer;

function spin() {
    timer = d3.timer(function () {
        var dt = Date.now() - time;

        proj.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);

        refresh();
    });
}

function dragstarted() {
    timer.stop();
    v0 = versor.cartesian(proj.invert(d3.mouse(this)));
    r0 = proj.rotate();
    q0 = versor(r0);
}

function dragged() {
    var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
        q1 = versor.multiply(q0, versor.delta(v0, v1)),
        r1 = versor.rotation(q1);
    proj.rotate(r1);
    refresh();
}