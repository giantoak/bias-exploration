var input = d3.select('#inputs')
    .append('div')
    .append('input')
    .attr('class', 'input-ctrl')
    .attr({'type': 'range',
            'min': -3.00,
            'max': 0,
            'step': 0.1,
            'value': -2.3 }); //We only want to bias in a positive sense: negative is weird, so min
    //is possitive
var input_text = d3.select('#inputs')
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

var rebias = function (x, y, ctrl, beta) {
    var denom = 1 + beta*ctrl;
    var adj_y = y / denom;
    return adj_y;
};

var plot = AdjustablePlot()
            .input(input)
            .input_text(input_text)
            .adjust(rebias)
            .y('lcounts')
            .x('lpop')
            .ctrl('college_plus_frac');
            //.x('lpop')
            //.y('unemployment')
            //.ctrl('college_plus_frac');

d3.csv('../data/region_level_acs_crime_adjusted.csv', function(d) {
    svg.datum(d)
       .call(plot);
});

