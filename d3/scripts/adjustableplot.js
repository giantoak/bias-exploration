
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
        betas = [],
        inputmap = {};

    var circles, sy, sx, sc;
    
    var adjust = null;

    /************************************
     * setter functions
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

    genPlot.inputs = function(values) {
        // takes a list of inputs, where each input is an object
        //  {
        //      'input': <a dom input element>,
        //      'input_text': <a dom text element>
        //      'column': 'a column to bind to'
        //  }
        //
        //  binds these columns to the inputs
        
        for (var input in values) {
            var elem = input.input,
                input_text = input.input_text,
                col = input.column;
            
            // identify these DOM elements for cross-reference
            inputmap[col] = { 
                'input': elem,
                'input_text': input_text
            };
            

            // event handler on the input should note which col
            try {
                elem.datum(col);
                elem.on('input', on_change);
            }
            catch (err) {
            // TODO: make this a more robust error message
                console.log(err.message);
            }
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
    genPlot.adjust = function(user_provided_func) {
        adjust = function (row) {
            var x = parseFloat(row[xcol]),
            y = parseFloat(row[ycol]),
            float_row = {};
            
            // TODO: convert to float ahead of time
            for (var elem in row) {
                float_row[elem] = parseFloat(row[elem]);
            }

            return user_provided_func(x, y, float_row, betas);
        };
        return genPlot;
    };

    /************************************
     * helper functions
     ************************************/

    function redraw_plot() {
        // this is where the plot gets reweighted based off slider value
        circles.transition()
            .duration(100)
            .attr('cy', function (d) {
                var adj_y = adjust(d);
                return sy(adj_y);
            });
    }

    function on_change(col, i) {
        console.log('on_change in ', col, this.value);
        betas[col] = this.value;
        inputmap[col]['input_text'].text(betas[col]);

        redraw_plot();
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
                        _check_nan(d[ycol])));
                // XXX removed check for ctrl cols; reimplement?
                
                
                return filtered;
            });
            var xextent  = d3.extent(data, function(d) { 
                return parseFloat(d[xcol]); 
            }),
            yextent = d3.extent(data, function(d) { 
                return parseFloat(d[ycol])/(1 + parseFloat(d[xcol]));
            });
            
            var columns = Object.keys(data[0]);

            var xmin = xextent[0],
                xmax = xextent[1],
                ymin = yextent[0],
                ymax = yextent[1];
            
            sx = d3.scale.linear()
                .domain([xmin, xmax])
                .range([pad.left*2, dim.w-pad.right*2]);
            sy = d3.scale.linear()
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
