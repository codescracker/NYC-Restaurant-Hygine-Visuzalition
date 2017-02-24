/**
 * Created by Yang on 11/23/2016.
 */
var stacked_svg = d3.select("#stackedBarChartDiv").append("svg").attr("width", 1000).attr("height", 400),
  stacked_margin = {top: 20, right: 20, bottom: 30, left: 90},
  stacked_width = +stacked_svg.attr("width") - stacked_margin.left - stacked_margin.right,
  stacked_height = +stacked_svg.attr("height") - stacked_margin.top - stacked_margin.bottom,
  stacked_g = stacked_svg.append("g").attr("transform", "translate(" + stacked_margin.left + "," + stacked_margin.top + ")");

var stacked_x = d3.scaleLinear()
  .rangeRound([0, stacked_width]);


var stacked_y = d3.scaleBand()
  .rangeRound([0, stacked_height])
  .padding(0.1)
  .align(0.1);

var stacked_z = d3.scaleOrdinal()
  .range(["#e69a61", "#9817ff", "#18c61a", "#33b4ff", "#c9167e", "#297853", "#d7011b", "#7456c7", "#7e6276",
    "#afb113", "#fd879c", "#fb78fa", "#24c373", "#45bbc5", "#766b21", "#abad93", "#c19ce3", "#fd8f11",
    "#2f56ff", "#307a11", "#b3483c", "#0d7396", "#94b665", "#9d4d91", "#b807c8", "#086cbf", "#a2abc5",
    "#a35702", "#d3084b", "#8c6148", "#fa82ce", "#71be42", "#2bc0a0", "#b64064", "#d09fa2", "#daa229",
    "#5a6f68", "#c1aa5f", "#8943dc", "#b72ba6", "#6e629e", "#e094bf", "#dd8df2", "#c03d0b", "#7db799",
    "#617046", "#ff8a78", "#1263e2", "#91aaea", "#cea37e", "#9e555c", "#67b4db", "#05767b", "#537428",
    "#04c553", "#88b3b7", "#ff8d52", "#8abb0b", "#9b43b9", "#c83030", "#6fbc7c", "#596c83", "#926023",
    "#e9958d", "#a127e3", "#027b36", "#94577d", "#7543f8", "#8257ab", "#c0ab3c", "#416ca4", "#a3b444",
    "#b53c7e", "#ca2064", "#64c104", "#5662c0", "#c1a0c6", "#5e56e3", "#9cb37c", "#9f573b", "#65bf64",
    "#7e6839", "#d6a250", "#c0384a"]);

var stacked_stack = d3.stack().order(d3.stackOrderDescending);
var stacked_tooltip_SG = d3.select('#stackedBarChartDiv').append("div")
  .attr("class", "tooltip_SG")
  .style("opacity", 0);

d3.csv("./data/stackedBarChart.csv", type, function (error, data) {
  if (error) throw error;

  data.sort(function (a, b) {
    return b.total - a.total;
  });

  stacked_y.domain(data.map(function (d) {
    return d.Boro;
  }));
  stacked_x.domain([0, d3.max(data, function (d) {
    return d.total;
  })]).nice();
  stacked_z.domain(data.columns.slice(1));
  stacked_g.selectAll(".serie")
    .data(stacked_stack.keys(data.columns.slice(1))(data))
    .enter().append("g")
    .attr("class", "serie")
    .attr("fill", function (d) {
      return stacked_z(d.key);
    })
    .selectAll("rect")
    .data(function (d) {
      for (var i = 0; i < d.length; i++) {
        d[i].push(d.key);
      }
      return d;
    })
    .enter().append("rect")
    .attr("class", function (d) {
      return encodeClassName(d[2]);
    })
    .attr("y", function (d) {

      return stacked_y(d.data.Boro);
    })
    .attr("x", function (d) {
      return stacked_x(d[0]);
    })
    .attr("width", function (d) {
      return stacked_x(d[1]) - stacked_x(d[0]);
    })
    .style("opacity", 0.7)
    .attr("height", stacked_y.bandwidth())
    .on("mouseover", function (d) {
      var c = encodeClassName(d[2]);
      d3.selectAll("." + c).transition().duration(1).style("opacity", 1);
      stacked_tooltip_SG.transition()
        .duration(200)
        .style("opacity", .9);
      stacked_tooltip_SG.html("Name: " + d[2] + "<br/> " + "Count: " + (d[1] - d[0]))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    })
    .on("mouseout", function (d) {
      var c = encodeClassName(d[2]);
      var temp = d3.selectAll("." + c).transition().duration(1).style("opacity", 0.7);
      stacked_tooltip_SG.transition().duration(100).style("opacity", 0);
    });

  stacked_g.append("g")
    .attr("class", "axis axis--y")
    // .attr("transform", "translate(0," + height + ")")
    .call(d3.axisLeft(stacked_y));


  // var legend = g.selectAll(".legend")
  //   .data(data.columns.slice(1).reverse())
  //   .enter().append("g")
  //   .attr("class", "legend")
  //   .attr("transform", function (d, i) {
  //     return "translate(0," + i * 20 + ")";
  //   })
  //   .style("font", "10px sans-serif");
  //
  // legend.append("rect")
  //   .attr("x", width - 18)
  //   .attr("width", 18)
  //   .attr("height", 18)
  //   .attr("fill", z);
  //
  // legend.append("text")
  //   .attr("x", width - 24)
  //   .attr("y", 9)
  //   .attr("dy", ".35em")
  //   .attr("text-anchor", "end")
  //   .text(function (d) {
  //     return d;
  //   });
});

function type(d, i, columns) {
  var t;
  for (var i = 1, t = 0; i < columns.length; ++i) {
    t += d[columns[i]] = +d[columns[i]];

  }
  d.total = t;
  return d;
}

function encodeClassName(s) {
  return s.replace(/\(|\)|\/|\,|\-|\s|\.|&/g, "");
}
