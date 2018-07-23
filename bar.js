
// Grab chart
// then we say that we are going to push the data into the new divs with select selectAll
// Then because we have new divs/data, we have to tell the enter function what to do
//in this case we tell it to append the div,--- Is this redundant?
// d3.select(".chart")
//     .selectAll("div").data(data)
//     .enter()
//     .append("div")
//         .style("width", function(d){return x(d)+ "px";})
//         .text(function(d) {return d;});

function type(d){
    d.value = +d.value;
    return d
}


var width=$(".container").width(),
    height=500;
//grab the chart svg element and save as variable
var chart = d3.select(".chart")
    .attr("width", width)
    .attr("height", height);

// Now load the data, the rest of the commands have to wait for the data to load. Hence the nesting
d3.tsv("data.tab", type, function(error, data){

    var y = d3.scaleLinear()
        .domain([0 , d3.max( data, function(d) {return d.value;} )])
        .range([height, 0]);

    var bar_width = width/data.length;

    //data join here, g to data
    var bar = chart.selectAll("g")
        .data(data)
        .enter()
            .append("g")
            .attr("transform", function(d,i) {return "translate(" + i*bar_width+",0)"; });

    bar.append("rect")
        .attr("y", function(d) {return y(d.value); })
        .attr("height", function(d) {return height-y(d.value); })
        .attr("width", bar_width-1);

    bar.append("text")
        .attr("x", bar_width/2)
        .attr("y", function(d) {return height-d.value;})
        .text(function(d) {return d.value;});
});
