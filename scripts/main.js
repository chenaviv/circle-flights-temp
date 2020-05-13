const planePath = 'M8.902 4.098v-.346c0-1.145.124-3.69-1.177-3.69-1.301 0-1.177 2.545-1.177 3.69v.346c-.865.472-4.104 2.634-4.646 2.995C.31 8.155.094 9.603 1.277 9.196c1.032-.355 4.374-1.498 5.27-1.8l.205 3.51s-.993.638-1.387 1.365v.99l2.068-.85h.584l2.068.85v-.99c-.395-.727-1.387-1.365-1.387-1.365l.204-3.51c.897.302 4.239 1.445 5.271 1.8 1.183.406.967-1.041-.625-2.103-.543-.361-3.781-2.523-4.646-2.995z'

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

var svg = d3.select('.globe-container').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

svg.call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged));

queue()
    .defer(d3.json, 'json/world.json')
    .defer(d3.json, 'json/routes.json')
    .await(ready);

circleStats();

function ready(error, world, data) {


    const routes = data.routes;
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
    //     .data(routes)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'point')
    //     .attr('d', path);

    svg.append('g')
        .attr('class', 'lines')
        .selectAll('text')
        .data(routes)
        .enter()
        .append('path')
        .attr('class', 'lines')
        .attr('id', d => stripWhitespace(d.destination))
        .attr('d', d => lineToIsrael(d));


    svg.append('g')
        .attr('class', 'planes')
        .selectAll('text')
        .data(routes)
        .enter()
        .append('path')
        .attr('class', 'plane')
        .attr('d', planePath)
        .style('background', `red`)
        .style('offset-path', d => `path("${lineToIsrael(d)}")`)
        .style('transform', 'rotate(94deg) translateX(-6px)');



    svg.append('g').attr('class', 'labels')
        .selectAll('text')
        .data(routes)
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

    createPlanes(routes);

    refresh();

    // spin();
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

function createPlanes(routes) {
    routes.forEach(route => {
        var planeEl = document.createElement('div');
        planeEl.className = 'plane';

        var path = document.querySelector(`#${stripWhitespace(route.destination)}`);

        if (path) {
            console.log(path.getAttribute('d'));
            d = path.getAttribute('d');
            planeEl.style.offsetPath = `path("${d}")`
            document.querySelector('.globe-container').appendChild(planeEl);
        }

    });
}