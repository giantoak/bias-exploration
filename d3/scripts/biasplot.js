//TODO: make this into a closure
function genScatterBias(data){
    "use strict";
    
    var w=500, h=500, r=3, alpha=.5;
    var pad = {left: 20, right: 20, top: 20, bottom: 20};

    var columns = Object.keys(data[0]);

    var c = {'x': 'unemployment',
            'y': 'b01001001',
            'ctrl': 'unemployment'};
    

    function check_nan(item) {
        return (isNaN(parseFloat(item)));
    }
    data = data.filter(function (d) {
        var filtered = (! (check_nan(d[c.x]) || 
                   check_nan(d[c.y]) || 
                   check_nan(d[c.ctrl])));
        
        return filtered;
    });

    var xextent  = d3.extent(data, function(d) { return parseFloat(d[c.x]); });
    var yextent = d3.extent(data, function(d) { return parseFloat(d[c.y]); });
    // no scaling yet:
    
    var xmin = xextent[0],
        xmax = xextent[1],
        ymin = yextent[0],
        ymax = yextent[1];
    
    console.log(xmin, xmax, ymin, ymax);
    var sx = d3.scale.linear().domain([xmin, xmax]).range([pad.left*2, w-pad.right*2]);
    var sy = d3.scale.linear().domain([ymin, ymax]).range([h-pad.bottom*2, pad.top*2]);

    // draw d3
    var svg = d3.select('#outputs').append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('fill-opacity', alpha);
    
    // optionally draw outline of scatterplot. omitted here
    var circles = svg.selectAll('circle')
        .data(data)
        .enter()
            .append('svg:circle')
            .attr('cx', function(d) { return sx(d[c.x]); })
            .attr('cy', function(d) { return sy(d[c.y]); })
            .attr('r', r);
    // Let's draw a scatterplot between two points:
    // x = unemployment, y = completeness
    console.log(circles);
    function draw(betas) {
        /* betas is an object mapping each column name with their associated
        coefficients.*/


    }

    // TODO: add text label above slider
    // TODO: have this display all possible inputs
    // set up input slider
    var input = d3.select('#inputs')
        .append('input')
        .attr({'type': 'range',
                'min': -1,
                'max': 1,
                'step': 0.05,
                'value': 0
                });
    
    //TODO: wrap input into div with text box?
    input.on('input', update_plot);


    function update_plot() {
        // this is where the plot gets reweighted based off slider value
        console.log(this.value);
    }

}

d3.csv('../data/region_level_acs_crime.csv', genScatterBias);
