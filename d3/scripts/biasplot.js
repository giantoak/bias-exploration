//TODO: make this into a closure
function genScatterBias(data){
    "use strict";
    
    // Load input sliders
    var input_text = d3.select('#inputs')
        .append('div')
        .attr('class', 'input-text')
        .text(0);

    var input = d3.select('#inputs')
        .append('div')
        .append('input')
        .attr('class', 'input-ctrl')
        .attr({'type': 'range',
                'min': -1,
                'max': 1,
                'step': 0.05,
                'value': 0
                });

    // TODO: have this display all possible inputs
    
    input.on('input', update_plot);

    // class variables
    var w = 400,
        h = 400,
        r=3,
        alpha=0.5,
        pad = {left: 50, right: 50, top: 50, bottom: 50},
        columns = Object.keys(data[0]),
        c = {'x': 'unemployment',
            'y': 'b01001001',
            'ctrl': 'unemployment'};
    
    
    // strip nans from data
    // TODO: have extra gutters on plot for nans
    function check_nan(item) {
        return (isNaN(parseFloat(item)));
    }
    data = data.filter(function (d) {
        var filtered = (! (check_nan(d[c.x]) || 
                   check_nan(d[c.y]) || 
                   check_nan(d[c.ctrl])));
        
        
        return filtered;
    });
    

    function ScatterBias(selection) {
        // append output div; add static scatterplot
        // get extremes and scales

        selection.each(function(data, i) {
            var xextent  = d3.extent(data, function(d) { return parseFloat(d[c.x]); });
            var yextent = d3.extent(data, function(d) { 
                return parseFloat(d[c.y])/(1 + parseFloat(d[c.x]));
            });
            var cextent = d3.extent(data, function(d) { return parseFloat(d[c.extent]); });
            
            var xmin = xextent[0],
                xmax = xextent[1],
                ymin = yextent[0],
                ymax = yextent[1],
                cmin = cextent[0],
                cmax = cextent[1];
            
            var sx = d3.scale.linear()
                    .domain([xmin, xmax])
                    .range([pad.left*2, w-pad.right*2]),
                sy = d3.scale.linear()
                    .domain([ymin, ymax])
                    .range([h-pad.bottom*2, pad.top*2]),
                sc = d3.scale.linear()
                    .domain([ymin, ymax])
                    .range([h-pad.bottom*2, pad.top*2]);

            var svg_static = d3.append('svg:svg')
                .attr('width', w)
                .attr('height', h)
                .attr('fill-opacity', alpha);
            
            svg_static.append("g")
                .attr("class", "y axis");

            svg_static.append("g")
                .attr("class", "x axis");
            
            var xAxis = d3.svg.axis()
                .scale(sx)
                .orient('bottom'),
                yAxis = d3.svg.axis()
                .scale(sy)
                .orient('left');
            
            svg_static.select('.x.axis')
                .attr('transform', 'translate(0, ' + (h - 2*pad.bottom) + ')')
                .call(xAxis);
            
            svg_static.select('.y.axis')
                .attr('transform', 'translate(' + (2*pad.left) + ',0)')
                .call(yAxis);


            // y-axis label. (0, h/2), rotated
            svg_static.append('text')
                .attr('x', pad.left)
                .attr('y', pad.top)
                .text(c.y);
            
            // x-axis label. (w/2, h)
            svg_static.append('text')
                .attr('x', w/2-pad.right)
                .attr('y', h-pad.bottom)
                .text(c.x);

            var circles_static = svg_static.selectAll('circle')
                .data(data)
                .enter()
                    .append('svg:circle')
                    .attr('cx', function(d) { return sx(d[c.x]); })
                    .attr('cy', function(d) { return rebias(d, 0); })
                    .attr('r', r);
        });
    }

    ScatterBias.height = function(value) {
        h = value;
        return ScatterBias;
    };
    ScatterBias.width = function(value) {
        w = value;
        return ScatterBias;
    };
    ScatterBias.radius = function(value) {
        r = value;
        return ScatterBias;
    };
    ScatterBias.pad = function(value) {
        pad = value;
        return ScatterBias;
    };
    ScatterBias.columns = function(value) {
        c = value;
        return ScatterBias;
    };

    

    // TODO: refactor scatterplot creation to avoid code duplication
    // draw moving bias scatterplot
    

    var output_div_moving = d3.select('#outputs')
        .append('div')
        .attr('class', 'output');

    var svg = output_div_moving
        .append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('fill-opacity', alpha);
    
    // initialize axes
    svg.append("g")
        .attr("class", "y axis");

    svg.append("g")
        .attr("class", "x axis");

    var xAxis = d3.svg.axis()
        .scale(sx)
        .orient('bottom'),
        yAxis = d3.svg.axis()
        .scale(sy)
        .orient('left');
    
    svg.select('.x.axis')
        .attr('transform', 'translate(0, ' + (h - 2*pad.bottom) + ')')
        .call(xAxis);
    
    svg.select('.y.axis')
        .attr('transform', 'translate(' + (2*pad.left) + ',0)')
        .call(yAxis);


    // y-axis label. (0, h/2), rotated
    svg.append('text')
        .attr('x', pad.left)
        .attr('y', pad.top)
        .text(c.y);
    
    // x-axis label. (w/2, h)
    svg.append('text')
        .attr('x', w/2-pad.right)
        .attr('y', h-pad.bottom)
        .text(c.x);

    var circles = svg.selectAll('circle')
        .data(data)
        .enter()
            .append('svg:circle')
            .attr('cx', function(d) { return sx(d[c.x]); })
            .attr('cy', function(d) { return rebias(d, 0); })
            .attr('r', r);

    
    function rebias(row, beta) {
        var x = parseFloat(row[c.x]),
            y = parseFloat(row[c.y]),
            ctrl = parseFloat(row[c.ctrl]);

        var denom = 1 + x + beta*ctrl;
        var adj_y = y / denom;
        return sy(adj_y);
    }

    function update_plot() {
        // this is where the plot gets reweighted based off slider value
        
        var slider_val = parseFloat(this.value);
        input_text.text(slider_val);
        
        circles.transition()
            .duration(100)
            .attr('cy', function (d) {
                var adj_y = rebias(d, slider_val);
                return adj_y;
            });
    }

}

d3.csv('../data/region_level_acs_crime.csv', genScatterBias);
