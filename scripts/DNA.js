console.log("hello from DNA.js")

// === To-Do ===
// [√] 1. date ticks
// [√] 2. dynamic scale
// [√] 3. adding area
// [√] 4. dynamic change the svg height
// [V] 5. tooptips
// [ ] 6. {optional} grade stream
// [ ] 7. cancel / drop off bar
// [ ] 8. {optional} drag to reorder
// [ ] 9. colors/styles
// [ ] 10. transitions
// [ ] 11. vertical mouseover line

DNA_para = {
    // bar count
    barCount:0,
    // SVG size setting
    svgWidth:500,
    svgHeight:60,
    barMargin:5,
    sideMargin:5,
    leftReservedMarg:20,
    rightReservedMarg:20,
    barHeight:50,
    axisHeight:20,
    // data from DNA.csv, restaurant id as key
    data:{},
    // main div and svg
    mainDiv:d3.select("#DNAChartDiv"),
    svg:null,
    // date range
    today:null,
    // tooltips
    tooltip:d3.tip(),
    // get data range and transform csv to object
    dataPreparing:function(data){
        data.forEach(function(d){
            var id = d["CAMIS"];
            d["GRADE DATE"] = Date.parse(d["GRADE DATE"])
            if(!DNA_para.data.hasOwnProperty(id)) DNA_para.data[id]=[]
            DNA_para.data[id].push(d)
        })
        this.today = new Date().getTime()
        // this.dateExtent = [d3.min(data,function(d){return d["GRADE DATE"]}),new Date().getTime()]
    }
}

dragManager = {
    addable:false
}

// interaction functions
DNA_actions = {
    // JQuery drag
    makeDraggable:function(class_name,key){
         $(class_name).draggable({
            revert: true,
            cursorAt: { left: -2, top: -2 },
            // CAMIS:null,

            // Register what we're dragging with the drop manager
            start: function (e) {
                // Getting the datum from the standard event target requires more work.
                // this.CAMIS = d3.select(e.target).datum()["CAMIS"];
                // console.log(this.CAMIS)
            },
            // Set cursors based on matches, prepare for a drop
            drag: function (e) {
                // matches = DragDropManager.draggedMatchesTarget();
                // body.style("cursor",function() {
                //     return (matches) ? "copy" : "move";
                // });
                // Eliminate the animation on revert for matches.
                // We have to set the revert duration here instead of "stop"
                // in order to have the change take effect.
                $(e.target).draggable("option","revertDuration",500)
            },
            // Handle the end state. For this example, disable correct drops
            // then reset the standard cursor.
            stop: function (e,ui) {
                // Dropped on a non-matching target.
                // if (!DragDropManager.draggedMatchesTarget()) return;
                // $(e.target).draggable("disable");
                $("body").css("cursor","");
                if(dragManager.addable){
                    var id = d3.select(e.target).datum()[key];
                    DNA_drawer.addColorBar(++DNA_para.barCount,id);
                }

            }
        })
    },
    gradeBarMouseover:DNA_para.tooltip.show,
    gradeBarMouseout:DNA_para.tooltip.hide
}

// SVG object drawer
DNA_drawer = {
    // width for each DNA bar
    barWidth : null,
    // date scale
    dateScale: null,
    // earliest date so far
    earliestDate:null,
    // init svg size and scale range
    chart_init:function(){
        d3.select("#SVG_Frame").selectAll("*").remove()
        d3.select("#SVG_Frame").append("svg")
            .attr("id","DNA_svg")
            .attr("width",DNA_para.svgWidth)
            .attr("height",DNA_para.svgHeight)

        DNA_para.svg = d3.select("#DNA_svg")

        DNA_para.tooltip
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {return "<p>"+d.name+"</p>" +
                "<p> GRADE : "+d.grade+"</p>"+
                "<p> From : "+(new Date(d.dates[0])).toDateString()+
                "<BR/>To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: "+(new Date(d.dates[1])).toDateString()+"</p>"
                ; });

        DNA_para.svg.call(DNA_para.tooltip)
    },
    init:function(){
        DNA_drawer.barWidth = DNA_para.svgWidth-2*DNA_para.sideMargin-DNA_para.leftReservedMarg-DNA_para.rightReservedMarg;
        d3.select("#DNA_right")
            .append("div")
            .attr("id","SVG_Frame")

        DNA_drawer.chart_init()
        DNA_drawer.frame();
        DNA_drawer.addingArea();
        DNA_drawer.resetButton();
    },

    resetButton:function(){
        d3.select("#DNA_right")
            .append("div")
            .attr("id","DNA_button_div")
            .append("input")
            .attr("value","Reset")
            .attr("type","submit")
            .on("click",function(){
                DNA_para.barCount = 0;
                DNA_drawer.earliestDate = null;
                DNA_drawer.chart_init();
                DNA_drawer.frame();
                DNA_drawer.addingArea();
            })
    },

    updateSVGHeight:function(h,svg = DNA_para.svg){
        var svg_width = svg.attr("width")
        var svg_height = +svg.attr("height")+h
        var line_data = [[0, 0, svg_width, 0],
            [0, 0, 0, svg_height],
            [svg_width, 0, svg_width, svg_height],
            [0, svg_height, svg_width, svg_height]];

        svg.transition().attr("height",+svg.attr("height")+h)

        svg.selectAll(".border")
            .data(line_data)
            .transition()
            .attr("x1", function (d) {return d[0]})
            .attr("y1", function (d) {return d[1]})
            .attr("x2", function (d) {return d[2]})
            .attr("y2", function (d) {return d[3]})
    },
    // draw a dish border for svg
    frame: function(svg = DNA_para.svg){
        var svg_width = svg.attr("width")
        var svg_height = svg.attr("height")
        var line_data = [[0, 0, svg_width, 0],
        [0, 0, 0, svg_height],
        [svg_width, 0, svg_width, svg_height],
        [0, svg_height, svg_width, svg_height]];

        svg.selectAll(".border")
            .data(line_data).enter()
            .append("line")
            .attr("class", "border")
            .attr("x1", function (d) {return d[0]})
            .attr("y1", function (d) {return d[1]})
            .attr("x2", function (d) {return d[2]})
            .attr("y2", function (d) {return d[3]})

    },
    // add a DNA bar to SVG
    addColorBar:function(index,rid,svg = DNA_para.svg){
        var mrg = DNA_para.barMargin,
            wdt = DNA_para.svgWidth,
            hgt = DNA_para.barHeight,
            smg = DNA_para.sideMargin,
            lmg = DNA_para.leftReservedMarg,
            axh = DNA_para.axisHeight

        DNA_drawer.updateSVGHeight(hgt+mrg+(index==1?axh:0))

        var grp = DNA_para.svg.append("g")
            .attr("transform","translate("+smg+","+(mrg+axh+index*(mrg+hgt))+")")

        var name;
        var grades = {}
        DNA_para.data[rid].forEach(function(d){
            // ` || ` is  in case of NaN grade data
            grades[d["GRADE DATE"]||DNA_para.today] = d["GRADE"]
            name = d["DBA"]
        })

        var sortedDate = Object.keys(grades).map(function(d){return +d}).sort()
        sortedDate.push(DNA_para.today)
        var appendingData = []
        for(var i=0;i<sortedDate.length-1;i++){
            var dates = [sortedDate[i],sortedDate[i+1]]
            appendingData.push({dates:dates,grade:grades[sortedDate[i]],name:name})
        }

        DNA_drawer.updateBars(d3.extent(sortedDate),svg,[smg+lmg,mrg+axh+hgt])

        grp.append("rect")
            .attr("width",this.barWidth)
            .attr("height",hgt)
            .attr("class","DNA_bar_bg")
            .attr("x",lmg)

        // grp.append("text").attr("class","DNA_bar_name")
        //     .html(name.replace(" ","<br\/>"))
        //     .attr("x",lmg/2)
        //     .attr("y",hgt/2+5)
        //     .attr( "text-anchor","middle")

        grp.selectAll(".grade")
            .data(appendingData)
            .enter()
            .append("rect")
            .attr("rx",hgt/5)
            .attr("ry",hgt/2)
            .attr("x",function(d,i){
                // here i is the index for filtered data index
                // instead of the index before filtering
                // i.e. start from 0 not 1 here.
                // so previous index is i not (i-1)
                return lmg+DNA_drawer.dateScale(d.dates[0])
            })
            .attr("y",0)
            .attr("width",function(d,i){
                var x1 = DNA_drawer.dateScale(d.dates[1])
                var x0 = DNA_drawer.dateScale(d.dates[0])
                return x1-x0;
            })
            .attr("height",hgt)
            .attr("class",function(d,i){return "grade "+grades[sortedDate[i]]})
            .on("mouseover",DNA_actions.gradeBarMouseover)
            .on("mouseout",DNA_actions.gradeBarMouseout)
    },
    // rectangle area where restaurants will be dragged in
    addingArea:function(){
        var mrg = DNA_para.barMargin,
            smg = DNA_para.sideMargin,
            lmg = DNA_para.leftReservedMarg,
            rmg = DNA_para.rightReservedMarg,
            wdt = DNA_para.svgWidth,
            hgt = DNA_para.barHeight

        var grp = DNA_para.svg.append("g")
            .attr("width",wdt)
            .attr("height",hgt)
            .attr("transform","translate("+smg+","+mrg+")")

        grp.append("rect")
            .attr("width",this.barWidth+lmg+rmg)
            .attr("height",hgt)
            .attr("rx",hgt/3)
            .attr("ry",hgt/3)
            .attr("id","DNA_addingArea")

        grp.append("text").attr("id","DNA_addingArea_text")
            .text("Drag the Restaurant Here")
            .attr("x",wdt/2)
            .attr("y",hgt/2+5)
            .attr( "text-anchor","middle")

        //interactions and drag logic
        $("#DNA_addingArea,#DNA_addingArea_text")
            .mouseenter(function(){
                dragManager.addable = true;
                d3.select(this.parentNode).select("rect")
                    .style("fill-opacity",.1)
            })
            .mouseleave(function(){
                dragManager.addable = false;
                d3.select(this.parentNode).select("rect")
                    .style("fill-opacity",0)
            });
    },
    // update the scale of all the bars
    updateBars:function(extent,svg,translate){
        // update scale
        if(DNA_drawer.earliestDate==null||DNA_drawer.earliestDate>extent[0]){
            DNA_drawer.earliestDate=extent[0]
            DNA_drawer.dateScale = d3.scaleLinear()
                .domain(extent)
                .range([0,DNA_drawer.barWidth])

            // update axis
            var timeExtent = DNA_drawer.dateScale.domain()
                        .map(function(d){return new Date(d)})
            d3.select("#DNA_top_axis").remove()
            DNA_drawer.addAxis(svg,translate,timeExtent)
        }

        // update previous bars scale
        d3.selectAll(".grade")
            .transition()
            .attr("x",function(d,i){
                return DNA_para.leftReservedMarg+DNA_drawer.dateScale(d.dates[0])
            })
            .attr("width",function(d,i){
                var x1 = DNA_drawer.dateScale(d.dates[1])
                var x0 = DNA_drawer.dateScale(d.dates[0])
                return x1-x0;
            })
    },
    addAxis:function(svg,translate,extent){
        var scale = DNA_drawer.dateScale.domain(extent)
        var axis = d3.axisTop(scale).ticks(4)
            .tickFormat(d3.timeFormat('%Y/%m/%d'))
        svg.append("g")
            .attr("id","DNA_top_axis")
            .attr("transform","translate("+translate+")")
            .call(axis)
    }
}

// some unit test for dragging functionality
test = {
    initDiv:function(){
        var div = DNA_para.mainDiv
            .insert("div","div")
            .attr("id","dragTestList")
        return div
    },
    rndFromArray:function(arr){
        var index =  Math.floor(Math.random()*arr.length)
        return arr[index]
    },
    listRnd5:function(div){
        var ret = []
        for(i=0;i<5;i++){
            var key = test.rndFromArray(Object.keys(DNA_para.data))
            var datum = DNA_para.data[key][0]
            ret.push(datum["CAMIS"])
            div.append("p")
                .datum(datum)
                .text(datum["DBA"]+" - "+datum["CAMIS"])
        }
        return ret;
    }
},

DNA_main = function(){
    d3.csv("data/DNA.csv",function(data){
        DNA_para.dataPreparing(data);
        DNA_drawer.init();

        // ----------- test ------------
        // var testDiv = test.initDiv()
        // var IDList = test.listRnd5(testDiv)
        // DNA_actions.makeDraggable("p","CAMIS")
        // ----------- test ------------

        // add div to show restaurant list for tree.js
        DNA_para.mainDiv.select("#DNA_left")
            .append("h2").text("Restaurant List and inspection scores trend")
        DNA_para.mainDiv.select("#DNA_left").append("p").text("(click for score details, double-click or drag for comparison)")

    })
}

DNA_main();
