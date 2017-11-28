const d3 = require('d3');

function getDrawers(svgContainer,data,  width, height){
  function getRealX(x){
    return (x)*width/100;
  }
  
  function getRealY(y){
    return (y)*height/100;
  }
  
  function getRealXWithMargin(x){
    return getRealX(10+0.8*x*100);
  }
  
  function getRealYWithMargin(y){
    y = -(y - 0.5) + 0.5;
    return getRealY(10 + 0.8*y*100);
  }
  
  function strangeRound(input){
    var rounding = 10 ** (input + "").length;
    
    while(rounding / 2 > input){
      rounding /= 2;
    }
  
    return rounding;
  }
  
  function getAxisPoints(count){
    var axispoints = [];
  
    var delta = 80/count;
  
    for(let i = 0; i < count; i++){
      axispoints.push([i % 2 ? 7.5 : 5, 10+i*delta]);
      axispoints.push([10, 10+i*delta]);
      axispoints.push([10, 10+(i+1) * delta]);
    }
  
    axispoints.push([5, 90]);
    axispoints.push([10, 90]);
    axispoints.push([10, 95]);
    axispoints.push([10, 90]);
  
    for(let i = 0; i < count; i++){
      axispoints.push([10+i*delta, 90]);
      axispoints.push([10+(i+1)*delta, 90]);
      axispoints.push([10+(i+1)*delta, i % 2 ? 95 : 92.5]);
    }
    return axispoints;
  }
  
  function drawAxises(count, maxX, maxY, svgContainer, xName){
        var axispoints = getAxisPoints(10);
    
        var lineFunction = d3.line()
                             .x(function(d) { return getRealX(d[0]); })
                             .y(function(d) { return getRealY(d[1]); })
                             .curve(d3.curveLinear);
    
        var lineGraph = svgContainer.append("path")
                                .attr("d", lineFunction(axispoints))
                                .attr("stroke", "black")
                                .attr("stroke-width", 0.5)
                                .attr("fill", "none");
  
        var xGraphText = svgContainer.append("g");
        var yGraphText = svgContainer.append("g");
        var graphNames = svgContainer.append("g");
  
        var textY = yGraphText.selectAll("text")
                         .data(axispoints.filter((a,i) => !(i % 6) && (i <= 3*count)))
                         .enter()
                         .append("text");
        
        var textLabelsY = textY
                   .attr("x", function(d) { return getRealX(d[0]+1); })
                   .attr("y", function(d) { return getRealY(d[1]-1); })
                   .text( function (d) { return "" + maxY/100 * (100 - (d[1] - 10)/0.8); })
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "1.5px")
                   .attr("fill", "black");
  
        var textX = xGraphText.selectAll("text")
                    .data(axispoints.filter((a,i) => i == count*3+2 || (!((i+3) % 6) && (i > 3*(count+1)))))
                    .enter()
                    .append("text");
        
        var textLabelsX = textX
                   .attr("x", function(d) { return getRealX(d[0]+1); })
                   .attr("y", function(d) { return getRealY(d[1]-1); })
                   .text( function (d) { return "" + maxX/100 * (d[0] - 10)/0.8; })
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "1.5px")
                   .attr("fill", "black");

        var axisLabels = graphNames.selectAll("text")
                          .data([[5, 7, xName], [92, 90, "Turns"]])
                          .enter()
                          .append("text");

        var axisLabelses = axisLabels.attr("x", function(d) { return getRealX(d[0])})
                  .attr("y", d => getRealY(d[1]))
                  .text(d => d[2])
                  .attr("font-family", "sans-serif")
                  .attr("font-size", "2px")
                  .attr("fill", "black");
  }

  function drawShipScores(){
    svgContainer.selectAll("*").remove();
    drawAxises(10, maxTurns, maxShips, svgContainer, "Shipcount");
    
    for(let playerNumber = 0; playerNumber < data.turns[0].players.length; playerNumber ++){
      var playerStatLineFunction = d3.line()
                                      .x(function(d) { return getRealXWithMargin(data.turns.indexOf(d)/maxTurns) })
                                      .y(function(d) { return getRealYWithMargin(d.players[playerNumber].ship_count/maxShips) })
                                      .curve(d3.curveBasis);

      var graph = svgContainer.append("path")
                              .attr("d", playerStatLineFunction(data.turns))
                              .attr("stroke", data.turns[0].players[playerNumber].color)
                              .attr("stroke-width", 0.3)
                              .attr("fill", "none");
    }
  }

  function drawPlanetScores(){
    svgContainer.selectAll("*").remove();
    drawAxises(10, maxTurns, maxPlanets, svgContainer, "Planetcount");
    
    for(let playerNumber = 0; playerNumber < data.turns[0].players.length; playerNumber ++){
      var playerStatLineFunction = d3.line()
                                      .x(function(d) { return getRealXWithMargin(data.turns.indexOf(d)/maxTurns) })
                                      .y(function(d) { return getRealYWithMargin(d.players[playerNumber].planet_count/maxPlanets) })
                                      .curve(d3.curveBasis);

      var graph = svgContainer.append("path")
                              .attr("d", playerStatLineFunction(data.turns))
                              .attr("stroke", data.turns[0].players[playerNumber].color)
                              .attr("stroke-width", 0.3)
                              .attr("fill", "none");                              
    }
  }

  var maxShips = 0;
  var maxPlanets = 0;

  data.turns.forEach(t => {
    t.players.forEach(p => {
      if(maxShips < p.ship_count){
        maxShips = p.ship_count;
      }
      if(maxPlanets < p.planet_count){
        maxPlanets = p.planet_count;
      }
    });
  });

  maxPlanets = strangeRound(maxPlanets);
  maxShips = strangeRound(maxShips);

  var maxTurns = strangeRound(data.turns.length);

  return {drawShipScores: drawShipScores, drawPlanetScores: drawPlanetScores};
}

module.exports = {
  getDrawers
};
