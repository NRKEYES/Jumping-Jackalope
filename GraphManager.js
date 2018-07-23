//Globals
//set chart size based on bootstrap block
var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};
var circle_radius = 15;


var mouse_over_node = null;
var mouse_down_node = null;
var mouse_up_node = null;

function reset_mouse_state() {
    mouse_over_node = null;
    mouse_down_node = null;
    mouse_up_node = null;
}

var links = []


var width = $(".node_plot").width(),
    height = $(".node_plot").height();

var width_for_3d = $(".pes_plot").width();
var height_for_3d = height;

var chemical_nodes_chart = d3.select(".ChemicalNodes")
    .attr("width", width)
    .attr("height", height);

var subway_pes = d3.select(".SubwayPES")
    .attr("width", width_for_3d)
    .attr("height", height);




var add_connection_state = 'confirmed'




// line displayed when dragging new nodes
const dragLine = chemical_nodes_chart.append('path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

var path = chemical_nodes_chart.append('g').selectAll('path');
var node = chemical_nodes_chart.append("g").selectAll("g");





subway_pes.append('defs').append('filter')
    .attr("id", "blur")

subway_pes.selectAll("filter")
    .append("feGaussianBlur")
    .attr("in", "SourceColor")
    .attr("stdDeviation", .5)
    .attr("result", "blur");





const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.ID).distance(100))
    .force("charge", d3.forceManyBody().strength(-150))
    .force('x', d3.forceX(width / 2))
    .force('y', d3.forceY(height / 2))
    .on("tick", ticked);


function ticked() {
    path
        .attr('d', function(d) {
            return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        });

    node
        .attr("transform", function(d) {
            return `translate(${d.x}, ${d.y})`;
        })
}



var origin_node = null;
var div = d3.select("#info").text("-")
    .style("opacity", .1);
//load in data from json and run the force graph
// for some reason this has to all go togther ...
var data;
d3.json("GoldDimer.json", function(error, graph) {
    if (error) throw error;
    data = graph;
    restart();
});


function restart() {

    node = node.data(data.nodes, (d) => d.ID);
    node.selectAll('rect')
        .each(function(d) {
            for (let i = 0; i < d.Connections.Confirmed.length; i++) {

                links.push({
                    'source': d,
                    'target': data.nodes.find(item => item.ID === d.Connections.Confirmed[i])
                });
                console.log(links)
            }

        });

    const g = node.enter().append('g');

    g.append("text")
        .attr("y", "15px")
        .html(function(d) {
            total = 0;
            for (let i = 0; i < d.Calculations.length; i++) {
                total += d.Calculations[i].xyz.length;
            }
            return total;
        })
    g.append("text")
        .attr("y", "30px")
        .html(function(d) {
            return Math.round(d.Energy);
        })

    g.append("rect")
        .attr("class", "nodes")
        .attr("class", function(d) {
            if (d.Calculations[0].Opt == "optTS") {
                return 'nodes TS'
            }
            return 'nodes';
        })
        .attr("width", 60)
        .attr("height", 35)
        .on("mouseover", function(d) {
            d3.select(this).attr("r", circle_radius * 1.1);
            mouse_over_node = true;
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Energy " + d.Energy + " eV");
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("r", circle_radius);
            mouse_over_node = null;
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function(d) {
            if (origin_node) {
                d3.select('.origin').attr("class", "nodes");
            }
            origin_node = d;
            d3.select(this).attr("class", "nodes origin");
            build_graph();
        })
        .on("mousedown", function(d) {
            mouse_down_node = d;
            // reposition drag line
            dragLine
                .classed('hidden', false)
                .attr('d', `M${mouse_down_node.x},${mouse_down_node.y}L${mouse_down_node.x},${mouse_down_node.y}`);
        })
        .on("mouseup", function(d) {
            mouse_up_node = d;
            dragLine
                .classed('hidden', true)
        })
        .each(function(d) {
            for (let i = 0; i < d.Connections.Confirmed.length; i++) {

                links.push({
                    'source': d,
                    'target': data.nodes.find(item => item.ID === d.Connections.Confirmed[i])
                });
                console.log(links)
            }

        });

    node = g.merge(node);



    path = path.data(links);


    path = path.enter().append('path').attr('class', 'link')
        .classed('CC', true)
        .attr('d', function(d) {
            return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        })
        .merge(path);

    path.exit().remove();

    simulation
        .nodes(data.nodes)
        .force('link').links(links)

    simulation.alphaTarget(0.2).restart();
}






// TODO fix this to add again
//chemical_nodes_chart.on("click", add_circle());


function add_connection() {
    if (!mouse_down_node.Connections.Confirmed.includes(((mouse_up_node.ID)))) {
        console.log("add an edge");
        mouse_down_node.Connections.Confirmed.push(mouse_up_node.ID);
    }
    if (!mouse_up_node.Connections.Confirmed.includes(((mouse_down_node.ID)))) {
        console.log("add an edge");
        mouse_up_node.Connections.Confirmed.push(mouse_down_node.ID);
    }
    restart();
}




function mousemove() {
    if (!mouse_down_node) return;
    // update drag line
    dragLine.attr('d', `M${mouse_down_node.x},${mouse_down_node.y}L${d3.mouse(this)[0]},${d3.mouse(this)[1]}`);
}

function mouseup() {
    if (mouse_down_node) {
        // hide drag line
        dragLine
            .classed('hidden', true)
            .style('marker-end', '');

        if (mouse_over_node && mouse_up_node != mouse_down_node) {
            add_connection();
            build_graph();
        }
    }

    reset_mouse_state();
}

chemical_nodes_chart.on("mousemove", mousemove)
    .on("mouseup", mouseup);


drag = simulation => {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}



//-------------------------Sub way Code lives here-----------------------------------------------




var subway_data = []

// It would be a really good idea to set the X position to a value based on geometric diferences between the states

// Add structures so this is equal for all systems
var Origin_Atom_List = [];
//This is the enrgy point we will set to 0
var Origin_Energy = 0;




function graph_states(_node, calling_level) {
    if (!subway_data.includes(_node)) {
        //add current level to node
        _node.Energy_Norm = _node.Energy - Origin_Energy //Normalize to the orgin
        _node.Level = calling_level + 1;
        // add to list of nodes
        subway_data.push(_node)
        //for each connection call this function
        for (let i = 0; i < _node.Connections.Confirmed.length; i++) {
            target_node = data.nodes.find(item => item.ID === _node.Connections.Confirmed[i]);
            graph_states(target_node, calling_level + 1);
        }
    } else {
        console.log("Node has already been added")
    }
}


function get_max_level() {
    // redefine scale in terms of hightest level
    max = 0;
    subway_data.forEach(function(d) {
        if (d.Level > max) {
            max = d.Level;
        }
    })
    return max;
}


function get_max_energy() {

    // redefine scale in terms of hightest level
    max = -100000000;
    subway_data.forEach(function(d) {
        if (d.Energy_Norm > max) {
            max = d.Energy_Norm;
        }
    })
    return max;
}

function get_min_energy() {
    // redefine scale in terms of hightest level
    min = 0;
    subway_data.forEach(function(d) {
        if (d.Energy_Norm < min) {
            min = d.Energy_Norm;
        }
    })
    return min;
}



var states = subway_pes.append('g').selectAll('g');

function build_graph() {
    //subway_pes.selectAll('rect').remove();

    states = subway_pes.selectAll('g').remove();
    // Clear the 3d rendings aways. I would like to do something more clever here, but this will work for now.
    // Reset variables for a completely fresh graph
    molecules.forEach(function(s) {
        scene.remove(s)
    });
    subway_paths = [];

    subway_data = []
    console.log(origin_node.Energy)
    Origin_Energy = origin_node.Energy

    //call add_state on orgin which starts recursize crawl

    graph_states(origin_node, 0)

    subway_update(subway_data)
}


function subway_update(nodes) {
    console.log(nodes)

    //Normalization is taken care of. Now I need to add addiction molecules!



    max_level = get_max_level();
    max_energy = get_max_energy();

    state_width = width_for_3d / (max_level * 2);
    state_height = 5;



    var to_2d_x = d3.scaleLinear()
        .domain([1, get_max_level()])
        .range([margin.left, width_for_3d - margin.right - state_width]);

    var to_3d_x = d3.scaleLinear()
        .domain([1, get_max_level()])
        .range([width_for_3d / -2 + margin.left, width_for_3d / 2 - margin.right - state_width]);


    var to_2d_y = d3.scaleLinear()
        .domain([get_max_energy(), get_min_energy()])
        .range([margin.top, height_for_3d - margin.bottom]);

    var to_3d_y = d3.scaleLinear()
        .domain([get_max_energy(), get_min_energy()])
        .range([height_for_3d / 2 - margin.top, -height_for_3d / 2 + margin.bottom]);


    //setup all of the display properties based on how much space is available per states

    // TODO I really want to implement geometric distnace between states as the IRC coordinate I should try this out ttonight



    function customYAxis(g) {
        g.call(d3.axisLeft(to_2d_y));
        g.select(".domain").remove()
        g.selectAll(".tick text").attr("x", -10)

    }




    states = states.data(subway_data, (d) => d.ID);
    // Remove old states
    states.exit().remove();


    // Create new states
    const g = states.enter().append('svg:g')
    g.append("svg:g")
        .attr("transform", function() {
            return "translate(" + 40 + "," + 0 + ")"
        })
        .call(customYAxis)

    g.append("rect")
        .attr('id', function(d) {
            return d.ID
        })
        .attr("class", "state")
        .attr("rx", 3)
        .attr("x", function(d) {
            return to_2d_x(d.Level);
        })
        .attr("y", function(d) {
            return to_2d_y(d.Energy_Norm);
        })
        .attr("width", state_width)
        .attr("height", state_height)
        .each(function(d) {
            // For each state render molecules
            // TODO add a loop over calculations
            for (let i = 0; i < d.Calculations.length; i++) {
                molecule_shift_x = state_width / (d.Calculations.length + 1);
                molecule_shift_y = 20;
                add_molecule(to_3d_x(+d.Level) + ((i + 1) * molecule_shift_x), to_3d_y(d.Energy_Norm) + molecule_shift_y, d.Calculations[i].xyz);
            }

            // For each connection add a path if it is forward.
            // TODO add different path types
            for (let i = 0; i < d.Connections.Confirmed.length; i++) {

                let target_node = subway_data.find(item => +item.ID === +d.Connections.Confirmed[i])
                if (target_node.Level > d.Level) {
                    g.append('path')
                        .style("filter", "url(#blur)")
                        .attr('d', function() {
                            return `M${to_2d_x(d.Level)+state_width},${to_2d_y(d.Energy_Norm)+state_height/2}L${to_2d_x(target_node.Level)},${to_2d_y(target_node.Energy_Norm)}`;
                        })
                }
            };
        });

    //merge together with existing states
    states = g.merge(states);
}
