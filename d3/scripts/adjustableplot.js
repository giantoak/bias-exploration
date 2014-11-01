function AdjustablePlot(data){
    "use strict";
    /***************************************
    /* configuration variables
    /***************************************/
    
    var dim = {
        'w': 400,
        'h': 400
        },
        pad = {
            left: 50, 
            right: 50, 
            top: 50, 
            bottom: 50
        };

    var r=2,
        alpha=1.0;
    
    var xcol = '',
        ycol = '',
        ctrlcol = '';

    var input = null,
        input_text = null,
        circles = null,
        sy = null,
        sx = null,
        sc = null;
    
    var adjust = null;

    /************************************
     * Getter and setter functions
     ************************************/

    genPlot.height = function(value) {
        dim.h = value;
        return genPlot;
    };
    genPlot.width = function(value) {
        dim.w = value;
        return genPlot;
    };
    genPlot.alpha = function(value) {
        alpha = value;
        return genPlot;
    };
    genPlot.radius = function(value) {
        r = value;
        return genPlot;
    };
    genPlot.padding = function(value) {
        pad = value;
        return genPlot;
    };

    genPlot.input = function(value) {
        try {
            value.on('input', update_plot);
        }
        catch (err) {
            // TODO: make this a more robust error message
            console.log('Warning: input slider not set');
        }

        
        return genPlot;
    };

    genPlot.input_text = function(value) {
        input_text = value;
        return genPlot;
    };
    
    genPlot.x = function(value) {
        xcol = value;
        return genPlot;
    };
    genPlot.y = function(value) {
        ycol = value;
        return genPlot;
    };
    genPlot.ctrl = function(value) {
        ctrlcol = value;
        return genPlot;
    };
    genPlot.adjust = function(user_provided_func) {
        adjust = function (row, beta) {
            var x = parseFloat(row[xcol]),
            y = parseFloat(row[ycol]),
            ctrl = parseFloat(row[ctrlcol]);

            return user_provided_func(x, y, ctrl, beta);
        };
        return genPlot;
    };

    /************************************
     * helper functions
     ************************************/

    function _check_nan(item) {
        return (isNaN(parseFloat(item)));
    }
    
    function update_plot() {
        // this is where the plot gets reweighted based off slider value
        
        var slider_val = parseFloat(this.value);

        try {
            input_text.text(slider_val);
        }
        catch (err) {
            console.log('Warning: input_text not set');
        }
        
        circles.transition()
            .duration(100)
            .attr('cy', function (d) {
                var adj_y = adjust(d, slider_val);
                return sy(adj_y);
            });
    }
    
    
    /************************************
     * Function for generating plot
     ************************************/
    
    function genPlot(svg) {
        // append output div; add static scatterplot
        // get extremes and scales

        svg.each(function(data, i) {
            data = data.filter(function (d) {
                var filtered = (! (_check_nan(d[xcol]) || 
                        _check_nan(d[ycol]) || 
                        _check_nan(d[ctrlcol])));
                
                
                return filtered;
            });
            var xextent  = d3.extent(data, function(d) { 
                return parseFloat(d[xcol]); 
            }),
            cextent = d3.extent(data, function(d) { 
                return parseFloat(d[ctrlcol]); 
            });
            
            var columns = Object.keys(data[0]);

            var xmin = xextent[0],
                xmax = xextent[1],
                //ymin = yextent[0],
                //ymax = yextent[1],
                cmin = cextent[0],
                cmax = cextent[1];
            console.log('cmax ' + cmax)
            console.log('cmin ' + cmin)
            console.log('xmax ' + xmax)
            console.log('xmin ' + xmin)
            
            var ymin = d3.extent(data, function(d) { 
                return parseFloat(d[ycol])/(1 + parseFloat(d[xcol] * cmax / 1));
            })[0];
            var ymax = d3.extent(data, function(d) { 
                return parseFloat(d[ycol])/(1 + parseFloat(d[xcol] * cmin / 20));
            })[1];
            console.log('ymax ' + ymax)
            console.log('ymin ' + ymin)

            sx = d3.scale.linear()
                .domain([xmin, xmax])
                .range([pad.left*2, dim.w-pad.right*2]);
            sy = d3.scale.linear()
                .domain([ymin, ymax])
                .range([dim.h-pad.bottom*2, pad.top*2]);
            sc = d3.scale.linear()
                .domain([ymin, ymax])
                .range([dim.h-pad.bottom*2, pad.top*2]);

            
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
                .attr('transform', 
                      'translate(0, ' + (dim.h - 2*pad.bottom) + ')')
                .call(xAxis);
            
            svg.select('.y.axis')
                .attr('transform', 'translate(' + (2*pad.left) + ',0)')
                .call(yAxis);


            // y-axis label. (0, h/2), rotated
            svg.append('text')
                .attr('x', pad.left)
                .attr('y', pad.top)
                .text(ycol);
            
            // x-axis label. (w/2, h)
            svg.append('text')
                .attr('x', dim.w/2-pad.right)
                .attr('y', dim.h-pad.bottom)
                .text(xcol);

            circles = svg.selectAll('circle')
                .data(data)
                .enter()
                    .append('svg:circle')
                    .attr('cx', function(d) { return sx(d[xcol]); })
                    .attr('cy', function(d) { return sy(adjust(d, 0)); })
                    .attr('r', r)
                    .attr('opacity', alpha);
        });
    }

    
    return genPlot;
    
}
