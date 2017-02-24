var bar_svg = d3.select("#barChartDiv").append("svg").attr("width", 600).attr("height", 600),
  bar_margin = {top: 20, right: 20, bottom: 30, left: 90},
  bar_width = bar_svg.attr("width") - bar_margin.left - bar_margin.right;
  bar_height = bar_svg.attr("height") - bar_margin.bottom - bar_margin.top;

  
var groupBarSvg = d3.select("#groupedBarChartDiv").append("svg").attr("width", 600).attr("height", 600);


var barToolTip = d3.select('#barChartDiv').append("div")
  .attr("class", "tooltip_SG")
  .style("opacity", 0);         

var colorScheme = d3.scaleOrdinal(d3.schemeCategory10);

var lowerG = groupBarSvg.append('g').attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");

var color = {'A':"green", 'B': "yellow",  'C' : "red", "P":"blue", "Z":"purple", "Not Yet Graded": "brown"};
d3.json("./data/bar_data.json", function (error, groupBar) {
  d3.csv("./data/percent_bar.csv", function (error, typeBar) {
    draw(groupBar['all'], 'All');
    typeBar.sort(function (a, b) {
      return b.Percent - a.Percent;
    });
    var y = d3.scaleBand().rangeRound([0, bar_height]),
      x = d3.scaleLinear().rangeRound([0, bar_width]);
    y.domain(typeBar.map(function (d, i) {
      return d.Type;
    }));

    x.domain([0, d3.max(typeBar, function (d) {
      return d.Percent;
    })]);

    var typeBar_g = bar_svg.append('g').attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");

    var bar = typeBar_g.selectAll('.typeBar')
      .data(typeBar)
      .enter().append('rect')
      .attr('y', function (d, i) {
        return y(d.Type);
      })
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', function (d) {
     //   console.log(d);
        return x(d.Percent);
      })
      .attr('fill', 'Green')
      .attr('stroke', 'Black')
      .on('click', function (d) {
        lowerG.selectAll('*').remove();
        draw(groupBar[d.Type], d.Type);
      })
      .on("mouseover", function (d) {
        barToolTip.transition()
          .duration(200)
          .style("opacity", .9);
        barToolTip.html("Type: " + d.Type + "<br/> " + "<br/> " + "Percentage: " + d.Percent)
          .style("left", (d3.mouse(this)[0] + 40) + "px")
          .style("top", (d3.mouse(this)[1] + 20) + "px")
          d3.select(this)
          .attr("fill", "red");
      })
      .on("mouseout", function (d) {
        barToolTip.transition().duration(100).style("opacity", 0)
        d3.select(barToolTip).remove();
        d3.select(this)
          .attr("fill", "Green");
      });
 

    typeBar_g.append('g')
      .attr('class', 'yaxis')
      .call(d3.axisTop(x));


    typeBar_g.append('g')
      .attr('class', 'xaxis')
      .call(d3.axisLeft(y))
      .style('font-size', 7);


    typeBar_g.append("text")
      .attr("x", 200)
      .attr("y", 300)
      .style("text-anchor", "top")
      .style('font-size', 20)
      .text("Percentage of Grade A");

  });
});




function findMax(data, type) {
  var max = 0;
  for (var key in data) {
    for (var key1 in data[key]) {
      max = Math.max(max, data[key][key1]);
    }
  }
  return max;
}


function bindAttrScore(data) {
  for (var key in data) {
    var value = [];
    for (var key1 in data[key]) {
      var arr = {};
      arr['Grade'] = key1;
      arr['Count'] = data[key][key1];
      arr['Boro'] = key;
      value.push(arr);

    }
    data[key].value = value;
    data[key].name = key;
  }
}


function changeToArray(data) {
  var result = [];
  for (var key in data) {
    result.push(data[key]);
  }
  return result;
}


function draw(d, type) {
  // reformat data
  var data = jQuery.extend(true, {}, d);
  var max = findMax(data);
  bindAttrScore(data);
  data = changeToArray(data);
 // console.log(data);

  var bar_x = d3.scaleBand().rangeRound([0, bar_width]),
    bar_y = d3.scaleLinear().rangeRound([bar_height, 0]);

  bar_x.domain(data.map(function (d) {
    return d.name;
  })).padding(0.2);
  bar_y.domain([max, 0]);

  var axisY = d3.scaleLinear().rangeRound([bar_height, 0]).domain([0, max]);
  var grades = ['A', 'B', 'C', 'P', 'Z', 'Not Yet Graded'];
  var stack_x = d3.scaleBand().rangeRound([0, bar_x.bandwidth()]);
  stack_x.domain(grades);
  var foodBar = lowerG.selectAll('.boro')
    .data(data)
    .enter().append('g')
    .attr('class', 'boro')
    .attr('transform', function(d, i) {
      return "translate(" + bar_x(d.name) + ",0)";
    });

  lowerG.append('g')
    .attr('class', 'yaxis')
    .call(d3.axisBottom(bar_x))
    .attr('transform', "translate(0," +  bar_height+ ")");

  lowerG.append('g')
    .attr('class', 'xaxis')
    .call(d3.axisLeft(axisY));

  //lowerG.append('text')
    //.style('font-size', 20)
    //.text("Grade Summary");

  lowerG.append("text")
      .attr("x", bar_width / 2)
      .attr("y", -5)
      .style("text-anchor", "middle")
      .style('font-size', 20)
      .html("Grade Summary")

  lowerG.append("text")
    .attr("x", bar_width / 2)
    .attr("y", 15)
    .style("text-anchor", "middle")
    .style('font-size', 17)
    .html(type)





  var bars = foodBar.selectAll('.foodBar')
    .data(function(d) {
      return d.value;
    })
    .enter()
    .append('rect')
    .attr('x', function (d, i) {
      return stack_x(d.Grade);
    })
    .attr('y', function (d) {
      return bar_height - bar_y(+d.Count);
    })
    .attr('width', stack_x.bandwidth())
    .attr('height', function (d) {
      return bar_y(+d.Count);
    })
    .attr('fill', function(d) {
      return color[d.Grade];
    })
    .attr('stroke', 'Black');

  var legend = lowerG.selectAll(".legend")
    .data(grades)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", bar_width )
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d) {
      return color[d];
    });

  legend.append("text")
    .attr("x", bar_width - 6)
    .attr('y', 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });


}

