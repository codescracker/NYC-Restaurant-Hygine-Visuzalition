console.log("hello from tree.js");

var tree_dispatch = d3.dispatch("food_type", "cuisine_description","boro","zipcode","street","building","restaurant","linechart");
var tree_parseTime = d3.timeParse("%m/%d/%Y");
var tree_svg = d3.select("#linechart_svg"),
    tree_margin = {top: 20, right: 20, bottom: 30, left: 50},
    tree_width = +tree_svg.attr("width") - tree_margin.left - tree_margin.right,
    tree_height = +tree_svg.attr("height") - tree_margin.top - tree_margin.bottom,
    tree_g = tree_svg.append("g").attr("transform", "translate(" + tree_margin.left + "," + tree_margin.top + ")").attr("id","linechar_svg_g");

var opt_inspections = d3.map();
var selection_dict = {};


d3.json("./data/tree_mapping_dict.json", function(err,data){
    selection_dict = data;

    d3.json("./data/tree_opt.json",function(err,data){
        data.forEach(function(d){
            opt_inspections.set(d[0],[d[2],d[1]])
        });

        d3.json("./data/tree_new_index.json",function (error, data) {
            if(error) throw error;

            var entries = data;
            // var entries = d3.nest()
            //     .key(function (d) {
            //         return d["Food Type"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["CUISINE DESCRIPTION"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["BORO"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["ZIPCODE"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["STREET"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["BUILDING"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .key(function (d) {
            //         return d["CAMIS"]
            //     })
            //     .sortKeys(d3.ascending)
            //     .entries(data);
            //
            // console.log(entries);
            //
            // function download(text, name, type) {
            //     var a = document.createElement("a");
            //     var file = new Blob([text], {type: type});
            //     a.href = URL.createObjectURL(file);
            //     a.download = name;
            //     a.click();
            // }
            // download(JSON.stringify(entries), 'test.json', 'text/plain');

            tree_dispatch.call("food_type", this, entries );
            tree_dispatch.call("cuisine_description", this ,entries[0]);
            tree_dispatch.call("boro",this, entries[0].V[0]);
            tree_dispatch.call("zipcode",this, entries[0].V[0].V[0]);
            tree_dispatch.call("street", this, entries[0].V[0].V[0].V[0]);
            tree_dispatch.call("building", this, entries[0].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("restaurant", this, entries[0].V[0].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, entries[0].V[0].V[0].V[0].V[0].V[0].V[0].K);
        })

    })
});


tree_dispatch.on("food_type.menu", function (food_type) {
    var select = d3.select("#food_type")
        .select("select")
        .on("change", function () {
            tree_dispatch.call("cuisine_description", this, food_type[this.value]);
            tree_dispatch.call("boro", this, food_type[this.value].V[0]);
            tree_dispatch.call("zipcode", this, food_type[this.value].V[0].V[0]);
            tree_dispatch.call("street", this, food_type[this.value].V[0].V[0].V[0]);
            tree_dispatch.call("building", this, food_type[this.value].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("restaurant", this, food_type[this.value].V[0].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, food_type[this.value].V[0].V[0].V[0].V[0].V[0].V[0].K);

            d3.select("#food_type_input").property("value",autoCompList[this.value])
        });

    select.selectAll("option")
        .data(food_type)
        .enter().append("option")
        .attr("value", function (d, i) {
            return i;
        })
        .text(function (d) {
            if (d.K=="S") return "Select ...";
            return selection_dict["Type"][d.K];
        });

    var input = d3.select("#food_type")
        .select("input")
        .attr("id","food_type_input");

    var autoCompList = food_type
            .map(function(d){
                if (d.K=="S") return " ";
                return selection_dict["Type"][+d.K];
            });

    $("#food_type_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var thisValue = selection_dict["Type"].indexOf(i.item.value)+1;
            tree_dispatch.call("cuisine_description", this, food_type[thisValue]);
            tree_dispatch.call("boro", this, food_type[thisValue].V[0]);
            tree_dispatch.call("zipcode", this, food_type[thisValue].V[0].V[0]);
            tree_dispatch.call("street", this, food_type[thisValue].V[0].V[0].V[0]);
            tree_dispatch.call("building", this, food_type[thisValue].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("restaurant", this, food_type[thisValue].V[0].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, food_type[thisValue].V[0].V[0].V[0].V[0].V[0].V[0].K);

            d3.select("#food_type").select("select").property("value",thisValue)
        }
    })
});

tree_dispatch.on("cuisine_description.menu",function (cuisine_desc) {

    d3.select("#cuisine_description")
        .select('select').selectAll("*")
        .remove();

    var select = d3.select("#cuisine_description")
        .select('select')
        .on("change", function () {
            tree_dispatch.call("boro", this, cuisine_desc.V[this.value]);
            tree_dispatch.call("zipcode", this, cuisine_desc.V[this.value].V[0]);
            tree_dispatch.call("street", this, cuisine_desc.V[this.value].V[0].V[0]);
            tree_dispatch.call("building", this, cuisine_desc.V[this.value].V[0].V[0].V[0]);
            tree_dispatch.call("restaurant", this, cuisine_desc.V[this.value].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, cuisine_desc.V[this.value].V[0].V[0].V[0].V[0].V[0].K);
            d3.select("#cuisine_description").property("value",autoCompList[this.value])
        });

    select.selectAll("option")
        .data(cuisine_desc.V)
        .enter().append("option")
        .attr("value", function(d,i) { return i; })
        .text(function(d) {
            if (d.K=="S") return "Select ...";d;
            return selection_dict["Cusine"][d.K];
        });

    var input = d3.select("#cuisine_description")
        .select("input")
        .attr("id","cuisine_description_input");

    var autoCompList = cuisine_desc.V
            .map(function(d){
                if (d.K=="S") return " ";
                return selection_dict["Cusine"][+d.K];
            });

    $("#cuisine_description_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var pos = selection_dict["Cusine"].indexOf(i.item.value);
            var thisValue = cuisine_desc.V.map(function(d){
                    if (d.K=="S") return -1;
                    return d.K
            }).indexOf(pos);
            console.log(cuisine_desc);_test = cuisine_desc;
            console.log(thisValue);
            tree_dispatch.call("boro", this, cuisine_desc.V[thisValue]);
            tree_dispatch.call("zipcode", this, cuisine_desc.V[thisValue].V[0]);
            tree_dispatch.call("street", this, cuisine_desc.V[thisValue].V[0].V[0]);
            tree_dispatch.call("building", this, cuisine_desc.V[thisValue].V[0].V[0].V[0]);
            tree_dispatch.call("restaurant", this, cuisine_desc.V[thisValue].V[0].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, cuisine_desc.V[thisValue].V[0].V[0].V[0].V[0].V[0].K);

            d3.select("#cuisine_description").select("select").property("value",thisValue)
        }
    })
});

tree_dispatch.on("boro.menu",function (boro) {
    d3.select("#boro")
        .select('select').selectAll("*")
        .remove();

    var select = d3.select("#boro")
        .select('select')
        .on("change", function () {
            tree_dispatch.call("zipcode", this, boro.V[this.value]);
            tree_dispatch.call("street", this, boro.V[this.value].V[0]);
            tree_dispatch.call("building", this, boro.V[this.value].V[0].V[0]);
            tree_dispatch.call("restaurant", this, boro.V[this.value].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, boro.V[this.value].V[0].V[0].V[0].V[0].K);
            d3.select("#boro").property("value",autoCompList[this.value])
        });
    select.selectAll("option")
        .data(boro.V)
        .enter().append("option")
        .attr("value", function(d,i) { return i; })
        .text(function(d) {
            if (d.K=="S") return "Select ...";
            return selection_dict["Boro"][d.K];
        });

    var input = d3.select("#boro")
        .select("input")
        .attr("id","boro_input");

    var autoCompList = boro.V
            .map(function(d){
                if (d.K=="S") return " ";
                return selection_dict["Boro"][+d.K];
            });

    $("#boro_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var pos = selection_dict["Boro"].indexOf(i.item.value);
            var thisValue = boro.V.map(function(d){
                    if (d.K=="S") return -1;
                    return d.K
            }).indexOf(pos);
            tree_dispatch.call("zipcode", this, boro.V[thisValue]);
            tree_dispatch.call("street", this, boro.V[thisValue].V[0]);
            tree_dispatch.call("building", this, boro.V[thisValue].V[0].V[0]);
            tree_dispatch.call("restaurant", this, boro.V[thisValue].V[0].V[0].V[0]);
            tree_dispatch.call("linechart", this, boro.V[thisValue].V[0].V[0].V[0].V[0].K);

            d3.select("#boro").select("select").property("value",thisValue)
        }
    })
});


tree_dispatch.on("zipcode.menu",function (zipcode) {

    d3.select("#zipcode")
        .select('select').selectAll("*")
        .remove();

    var select = d3.select("#zipcode")
        .select('select')
        .on("change", function () {
            tree_dispatch.call("street", this, zipcode.V[this.value]);
            tree_dispatch.call("building", this, zipcode.V[this.value].V[0]);
            tree_dispatch.call("restaurant", this, zipcode.V[this.value].V[0].V[0]);
            tree_dispatch.call("linechart", this, zipcode.V[this.value].V[0].V[0].V[0].K);
            d3.select("#zipcode").property("value",autoCompList[this.value])
        });

    select.selectAll("option")
        .data(zipcode.V)
        .enter().append("option")
        .attr("value", function(d,i) { return i; })
        .text(function(d) {
            if (d.K=="S") return "Select ...";
            return selection_dict["Zipcode"][d.K];
         });

    var input = d3.select("#zipcode")
        .select("input")
        .attr("id","zipcode_input");

    var autoCompList = zipcode.V
            .map(function(d){
                if (d.K=="S") return {"label":" ","value":" "};
                return {"label":selection_dict["Zipcode"][+d.K],"value":selection_dict["Zipcode"][+d.K]};
            });

    $("#zipcode_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var pos = selection_dict["Zipcode"].indexOf(i.item.value);
            var thisValue = zipcode.V.map(function(d){
                    if (d.K=="S") return -1;
                    return d.K
            }).indexOf(pos);
            tree_dispatch.call("street", this, zipcode.V[thisValue]);
            tree_dispatch.call("building", this, zipcode.V[thisValue].V[0]);
            tree_dispatch.call("restaurant", this, zipcode.V[thisValue].V[0].V[0]);
            tree_dispatch.call("linechart", this, zipcode.V[thisValue].V[0].V[0].V[0].K);

            d3.select("#zipcode").select("select").property("value",thisValue)
        }
    })
});

tree_dispatch.on("street.menu",function (street) {

    d3.select("#street")
        .select('select').selectAll("*")
        .remove();

    var select = d3.select("#street")
        .select('select')
        .on("change", function () {
            tree_dispatch.call("building", this, street.V[this.value]);
            tree_dispatch.call("restaurant", this, street.V[this.value].V[0]);
            tree_dispatch.call("linechart", this, street.V[this.value].V[0].V[0].K);
            d3.select("#street").property("value",autoCompList[this.value])
        });

    select.selectAll("option")
        .data(street.V)
        .enter().append("option")
        .attr("value", function(d,i) { return i; })
        .text(function(d) {
            if (d.K=="S") return "Select ...";
            return selection_dict["Street"][d.K];
         });

    var input = d3.select("#street")
        .select("input")
        .attr("id","street_input");

    var autoCompList = street.V
            .map(function(d){
                if (d.K=="S") return {"label":" ","value":" "};
                return {"label":selection_dict["Street"][+d.K],"value":selection_dict["Street"][+d.K]};
            });
    $("#street_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var pos = selection_dict["Street"].indexOf(i.item.value);
            var thisValue = street.V.map(function(d){
                    if (d.K=="S") return -1;
                    return d.K
            }).indexOf(pos);
            tree_dispatch.call("building", this, street.V[thisValue]);
            tree_dispatch.call("restaurant", this, street.V[thisValue].V[0]);
            tree_dispatch.call("linechart", this, street.V[thisValue].V[0].V[0].K);

            d3.select("#street").select("select").property("value",thisValue)
        }
    })
});

tree_dispatch.on("building.menu",function (buildings) {

    d3.select("#building").selectAll("*")
        .select('select')
        .remove();

    var select = d3.select("#building")
        .select('select')
        .on("change", function () {
            tree_dispatch.call("restaurant", this, buildings.V[this.value]);
            tree_dispatch.call("linechart", this, buildings.V[this.value].V[0].K);
            d3.select("#building").property("value",autoCompList[this.value])
        });

    select.selectAll("option")
        .data(buildings.V)
        .enter().append("option")
        .attr("value", function(d,i) { return i; })
        .text(function(d) {
            if (d.K=="S") return "Select ...";
            return selection_dict["Building"][d.K];
        });

    var input = d3.select("#building")
        .select("input")
        .attr("id","building_input");

    var autoCompList = buildings.V
            .map(function(d){
                if (d.K=="S") return {"label":" ","value":" "};
                return {"label":selection_dict["Building"][+d.K],"value":selection_dict["Building"][+d.K]};
            });
    $("#building_input").autocomplete({
        source:autoCompList,
        select:function(o,i){
            var pos = selection_dict["Building"].indexOf(i.item.value);
            var thisValue = buildings.V.map(function(d){
                    if (d.K=="S") return -1;
                    return d.K
            }).indexOf(pos);
            tree_dispatch.call("restaurant", this, buildings.V[thisValue]);
            tree_dispatch.call("linechart", this, buildings.V[thisValue].V[0].K);

            d3.select("#building").select("select").property("value",thisValue)
        }
    })
});

tree_dispatch.on("restaurant.menu",function (restaurants) {

    // d3.select("#restaurant")
    //     .select('select')
    //     .remove();

    // var select = d3.select("#restaurant")
    //     .append('select')
    //     .on("change", function() {
    //         console.log(restaurants.V[this.value])
    //         tree_dispatch.call("linechart", this, restaurants.V[this.value].K)
    //     });

    // select.selectAll("option")
    //     .data(restaurants.V)
    //     .enter().append("option")
    //     .attr("value", function(d,i) { return i; })
    //     .text(function(d) {return opt_inspections.get(d.K)[1]; });
    d3.selectAll(".draggable_p").remove();
    d3.select("#DNA_left")
        .selectAll(".draggable_p")
        .data(restaurants.V)
        .enter().append("p")
        .attr("class","draggable_p")
        .text(function(d) {return opt_inspections.get(d.K)[1]; })
        .on("click",function(d){
            tree_dispatch.call("linechart", this, d.K);
        })
        .append("svg")
        .attr("width",120)
        .attr("height",30)
        .append("g")
        .attr("transform", "translate(10,"+"0)")
        .append("path")
        .datum(function (d) {
            return d.K
        })
        .attr("d",function (key) {

            var inspections = opt_inspections.get(key)[0];

            inspections.forEach(function (d) {
                d.SCORE = +d[1];
                d.date = tree_parseTime(d[0]);
            });

            inspections.sort(function (a,b) {
                return a.date - b.date;
            });

            var x = d3.scaleTime()
                .rangeRound([0, 120]);

            var y = d3.scaleLinear()
                .rangeRound([30, 0]);

            x.domain(d3.extent(inspections, function(d) { return d.date; }));
            y.domain(d3.extent(inspections, function(d) { return d.SCORE; }));

            return d3.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.SCORE);
                })(inspections);
        })
        .attr("stroke", "steelblue")
        .attr("stroke-width", "2")
        .attr("fill", "none");

    $(".draggable_p").dblclick(function(e){
        var id = d3.select(e.target).datum()["K"];
        console.log(d3.select(e.target).datum()["K"])
        DNA_drawer.addColorBar(++DNA_para.barCount,id);
    });
    
    DNA_actions.makeDraggable(".draggable_p","K")
});

tree_dispatch.on("linechart.draw",function (key) {
    var inspections = opt_inspections.get(key)[0];

    inspections.forEach(function (d) {
        d.SCORE = +d[1];
        d.date = tree_parseTime(d[0]);
    });

    inspections.sort(function (a,b) {
        return a.date - b.date;
    });


    var x = d3.scaleTime()
        .rangeRound([0, tree_width]);

    var y = d3.scaleLinear()
        .rangeRound([tree_height, 0]);

    x.domain(d3.extent(inspections, function(d) { return d.date; }));
    y.domain(d3.extent(inspections, function(d) { return d.SCORE; }));

    var line = d3.line()
        // .curve(d3.curveCatmullRom.alpha(1.0))
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.SCORE); });

    if(d3.select("#x_axis").empty()){
        tree_g.append("g")
            .attr("class", "axis axis--x")
            .attr("id" , "x_axis")
            .attr("transform", "translate(0," + tree_height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b/%y")));
    }
    else{
        d3.select("#x_axis").remove();
        tree_g.append("g")
            .attr("class", "axis axis--x")
            .attr("id" , "x_axis")
            .attr("transform", "translate(0," + tree_height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b/%y")));
    }

    if(d3.select("#y_axis").empty()){
        tree_g.append("g")
            .attr("class", "axis axis--y")
            .attr("id", "y_axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text("SCORE");
    }
    else {
        d3.select("#y_axis").remove();

        tree_g.append("g")
            .attr("class", "axis axis--y")
            .attr("id", "y_axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text("SCORE");
    }


    if (d3.select("#score_line").empty()) {
        var path = tree_g.append("path")
            .datum(inspections)
            .attr("d", line)
            .attr("class", "line")
            .attr("id", "score_line")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2")
            .attr("fill", "none");

        var totalLength = path.node().getTotalLength();

        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);


    }
    else{
        d3.select('#score_line')
            .transition()
            .duration(2500)
            .attrTween('d', function (d) {
                var previous = d3.select(this).attr('d');
                var current = line(inspections);
                return d3.interpolatePath(previous, current);
            });

    }

    if(d3.select("#arrow").empty()){
        var arrow = tree_g.append("path")
            .attr("d", function () {
                if(inspections[inspections.length-1].SCORE > inspections[0].SCORE){
                    return "M16 1l-15 15h9v16h12v-16h9z"
                }
                else{
                    return "M16 31l15-15h-9v-16h-12v16h-9z"
                }
            })
            .attr("fill", function () {
                if(inspections[inspections.length-1].SCORE > inspections[0].SCORE){
                    return d3.rgb(255, 0, 0)
                }
                else{
                    return d3.rgb( 0, 128, 0)
                }
            })
            .attr("id","arrow")
            .attr("transform", function(d) { return "translate(" + 30 + "," + 30 + ")"; });

        }
    else{
        d3.select("#arrow")
            .transition()
            .duration(2500)
            .attrTween('fill', function (d) {
                var previous = d3.select(this).attr('fill');
                var current;
                if(inspections[inspections.length-1].SCORE > inspections[0].SCORE){
                    current =  d3.rgb(255, 0, 0)
                }
                else{
                    current = d3.rgb( 0, 128, 0)
                }
                return d3.interpolateRgb(previous, current);
            })
            .attrTween('d',function (d) {
                var previous = d3.select(this).attr('d');
                var current;
                if(inspections[inspections.length-1].SCORE > inspections[0].SCORE){
                    current = "M16 1l-15 15h9v16h12v-16h9z"
                }
                else{
                    current = "M16 31l15-15h-9v-16h-12v16h-9z"
                }
                return d3.interpolate(previous,current);
            });
    }

});
