var input_unemployment = d3.select('#inputs')
    .append('div')
    .append('input')
    .attr('class', 'input-ctrl')
    .attr({'type': 'range',
            'min': -1,
            'max': 1,
            'step': 0.05,
            'value': 0
            });
var input_text_unemployment = d3.select('#inputs')
    .append('div')
    .attr('class', 'input-text')
    .text(0);

var output_div = d3.select('#outputs')
    .append('div')
    .attr('class', 'output');

var svg = output_div
    .append('svg:svg')
    .attr('width', 400)
    .attr('height', 400)
    .attr('fill-opacity', 1);

var rebias = function(x, y, data, betas) {
    var denom = 1 + x + betas.unemployment*data.unemployment;
    var adj_y = y/denom;
    return adj_y;
};

var plot = AdjustablePlot()
            .inputs([{
                'input': input,
                'input_text': input_text,
                'column': 'unemployment'
            }])
            .adjust(rebias)
            .x('unemployment')
            .y('b01001001');

d3.csv('../data/region_level_acs_crime.csv', function(d) {
    svg.datum(d)
       .call(plot);
});
