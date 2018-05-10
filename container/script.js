var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;

var BOX_SIZE = 0.8,
    FORCE_GRAVITY = 1,
    FORCE_GROUPING = 10,
    FORCE_COLLIDE = 1,
    DECAY=0.03, //default 0.0228
    FORCE_TIME = 0;

var WATER = {
    'collision': 'water',
    'radius': 5,
    'force_many_body': -1,
}

var BALLS = {
    'collision': 'balls',
    'radius': 20,
    'force_many_body': 1,
}

// time: 0-100;
var groups = [
    // WATER
    Object.assign({
        id: 'w1',
        count: 2000,
        links: ['b1','b2','b3'],
        time: 20,
        color: '#F00',
    }, WATER),

    Object.assign({
        id: 'w2',
        count: 300,
        links: ['b4','b5','b7'],
        time: 50,
        color: '#0F0',
    }, WATER),

    Object.assign({
        id: 'w3',
        count: 1300,
        links: ['b4','b5','b7'],
        time: 100,
        color: '#00F',
    }, WATER),

    // BALLS
    Object.assign({
        id: 'b1',
        time: 0,
        count: 17,
        color: '#0AA',
    }, BALLS),

    Object.assign({
        id: 'b2',
        time: 5,
        count: 13,
        color: '#A0A',
    }, BALLS),

    Object.assign({
        id: 'b3',
        time: 8,
        count: 9,
        color: '#AA0',
    }, BALLS),

    Object.assign({
        id: 'b4',
        time: 12,
        count: 4,
        color: '#A00',
    }, BALLS),

    Object.assign({
        id: 'b5',
        time: 16,
        count: 30,
        color: '#00A',
    }, BALLS),

    Object.assign({
        id: 'b6',
        time: 24,
        count: 13,
        color: '#0A0',
    }, BALLS),

    Object.assign({
        id: 'b7',
        time: 37,
        count: 20,
        color: '#050',
    }, BALLS),

    Object.assign({
        id: 'b8',
        time: 42,
        count: 7,
        color: '#500',
    }, BALLS),

    Object.assign({
        id: 'b9',
        time: 50,
        count: 2,
        color: '#005',
    }, BALLS),
];

var i=0;

_.each(groups, function(g){
    // tmp
    if (g.collision != WATER.collision)
        return;

    g.nodes = d3.range(g.count).map(function(){
        y_init = height * ( 1 - BOX_SIZE * g.time/100) + (Math.random()-0.5) * g.count * 0.1;
        return {
            index: i++,
            group: g,
            x: Math.random()*width,
            // put y accorting to time
            y: y_init,
            y_init: y_init,
        };
    });

    var simulation = d3.forceSimulation(g.nodes)
        .alphaDecay(DECAY)
        .force('grouping', d3.forceManyBody().strength(FORCE_GROUPING).distanceMin(0.5*g.radius).distanceMax(10*g.radius));

    g.simulation = simulation;
});

var water_nodes = _.filter(groups, function (g){
    return g.collision == WATER.collision;
 }).reduce(function (sum, g){
     return sum.concat(g.nodes);
 }, []);

// WATER -- no need to drag, so don't save to a variable
d3.forceSimulation(water_nodes)
    .force('collide', d3.forceCollide(WATER.radius).strength(FORCE_COLLIDE))
//    .force('collide', d3.forceCollide(WATER.radius).radius(function(d) { return d.r + 0.5; }).iterations(2))
    .force("down", forceGravity(FORCE_GRAVITY))
    .alphaDecay(DECAY)
    .on("tick", ticked);


/*
var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-0.1*radius))
    .force("down", d3.forceY(height))
    .force("colide", d3.forceCollide(2*radius))
//                    .force("link", d3.forceLink(links).strength(1).distance(20).iterations(10))
//                   .force("box", box_force)
    .on("tick", ticked);


var simulation = d3.forceSimulation(nodes)
                   .force("charge", d3.forceManyBody().strength(-0.1*radius))
                   .force("down", d3.forceY(height))
                   .force("colide", d3.forceCollide(2*radius))
//                    .force("link", d3.forceLink(links).strength(1).distance(20).iterations(10))
//                   .force("box", box_force)
                   .on("tick", ticked);

d3.select(canvas)
  .call(d3.drag()
          .container(canvas)
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
*/

/*
function box_force() {
    var fixed_radius = radius*1.1;
    for (var i = 0, n = nodes.length; i < n; ++i) {
        curr_node = nodes[i];
        if (curr_node.y < height * 0.2){
            continue;
        }
        curr_node.x = Math.max(radius, Math.min(width - radius, curr_node.x));
        curr_node.y = Math.max(radius, Math.min(height - radius, curr_node.y));
        // curr_node.y = Math.max(radius, curr_node.y);
    }
}
*/
function forceGravity(value) {
    var nodes;
    function force(alpha){
        for (var i = 0, n = nodes.length, node, k = alpha * 0.1; i < n; ++i) {
            node = nodes[i];
            node.vy += value * alpha * alpha;
        }
    }
    force.initialize = function(_){
        nodes = _;
    };

    return force;

}

function fixBox(node) {
    if (node.y < height * (1- BOX_SIZE)){
        return;
    }
    var radius = node.group.radius;
    node.x = Math.max(radius, Math.min(width - radius, node.x));
    node.y = Math.max(radius, Math.min(height - radius, node.y));
}

function ticked() {
    var nodes = this.nodes();

    context.clearRect(0, 0, width, height);
    context.save();
    //context.translate(width / 2, height / 2);

    context.beginPath();
    //links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    nodes.forEach(fixBox);
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();

    context.restore();
}

function dragsubject() {
    //return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
    return simulation.find(d3.event.x, d3.event.y);
}

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
    context.fillStyle = d.group.color;
    //context.strokeStyle = d.group.color;
    context.moveTo(d.x + d.group.radius, d.y);
    context.beginPath();
    context.arc(d.x, d.y, d.group.radius, 0, 2 * Math.PI);
    context.fill();
}

