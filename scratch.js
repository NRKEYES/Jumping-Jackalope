var x = d3.scaleLinear()
  .domain([0, chart_width])
  .range([0, chart_width]);

var y = d3.scaleLinear()
  .domain([0,300])
  .range([chart_height,0])





flat.append("rect")
    .attr("y", function(d) {return chart_height-y(d.Energy)})
    .attr("height", flat_height)
    .attr("width", flat_width);

flat.append("text")
  .attr("x", flat_width/2)
  .attr("y", function(d) {return chart_height - y(d.Energy)})
  .text( function(d) {return d.Energy; });


console.log(d3.keys(data))

for (i = 0; i < d3.keys(data).length; i++){
  console.log(data[i].ConfirmedConnections);

  for(j = 0; j < data[i].ConfirmedConnections.length; j++){
     point=data[i].ConfirmedConnections[j]
     console.log(point)

     subway.append("line")
        .attr("x1", 100)
        .attr("y1", y(data[i].Energy))
        .attr("x2", 400)
        .attr("y2", 100)


  }

}



function process(data){
   console.log("In Process")
   console.log(data)

   var flat = subway.selectAll("g")
       .data(data)
       .enter()
           .append("g")
           .attr("transform", function(d,i) {return "translate(" + i*flat_spacing+",0)"; });

}


let details = prompt(" What's the molecule homie?")

if(details){
    chemical_nodes_chart.selectAll("nodes")
        .data(nodes)
        .enter()
            .append("circle.node")
            .attr("r",10)
            .attr("cx", coords[0])
            .attr("cy", coords[1]);

}


//produce subway pes with images


var config = {
   container: d3.select(".subway"),
   width: window.innerWidth,
   height: window.innerHeight,
   data: NaN
};


const looper = d3.forceSimulation()
               .on("tick", update)


function load_data(_config){
   // The only goal here is to load in the JSOn FILE
   d3.json("GoldDimer.json", function(error, data){
      if (error) throw error;

       data.forEach(function(d) {
          d.ID = +d.ID;
          d.Energy = +d.Energy;
      });

      console.log(_config)

      return{
         data: data
      }
   });
}


function initialize(_config){

}









chart = load_data(config)


console.log(origin_node)



//What I really need to do here:
// label one state as the origin.
// This origin state is start of the tree, so go to connecting nodes





// init D3 force layout
const force = d3.forceSimulation()
  .force('link', d3.forceLink().id((d) => d.id).distance(150))
  .force('charge', d3.forceManyBody().strength(-500))
  .force('x', d3.forceX(width / 2))
  .force('y', d3.forceY(height / 2))
  .on('tick', tick);

  // update force layout (called automatically each iteration)
  function tick() {
    // draw directed edges with proper padding from node centers
  }








  if(!mouse_over_node){
    let coords = d3.mouse(this);
    //console.log(coords);

    nodes.append("svg:circle")
        .attr("class","node")
        .attr("r", node_radius)
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .on("mouseover", function(d){
            d3.select(this).attr("r", node_radius * 1.5);
            mouse_over_node = true;
        })
        .on("mouseout", function(d){
            d3.select(this).attr("r", node_radius);
            mouse_over_node = false;
        })
        .on("click", function (d) {
            if(origin_node){
                origin_node.attr("class","node")
            }
            origin_node = d3.select(this)
            origin_node.attr("class","node origin")
            subway_update();

            console.log(origin_node)
        })
  }





  [
      {"ID":1,
       "Energy": 150,
       "Calculations":[{
           "mol1":{
               "Charge": 1,
               "Multiplicity": 2,
               "xyz": [
                   "Au  -0.041068      0.0      0.0",
                   "Au  2.441068      0.0      0.0"
               ]
           },
           "mol2": {
               "Charge": 0,
               "Multiplicity": 1,
               "xyz": [
                   "C       -5.244785      2.698391      -0.000185",
                   "H       -4.144932      2.69861      0.000126",
                   "H       -5.612135      2.271043      0.944169",
                   "H       -5.612294      2.094553     -0.842487",
                   "H       -5.612017      3.729627     -0.101623"
               ]}
       }],
       "ConfirmedConnections":[
           "2",
           "3"
       ]
      },

      {"ID":"2",
      "Energy": 200,
      "ConfirmedConnections":[
          "1"
      ]
      },

      {"ID":"3",
      "Energy": 100,
      "ConfirmedConnections":[
          "1"
      ]
      }

  ]
