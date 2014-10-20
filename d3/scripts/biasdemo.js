function make_input(id) {
    return  d3.select('#inputs')
    .append('div')
    .attr('id', id)
    .append('input')
    .attr('class', 'input-ctrl')
    .attr({'type': 'range',
            'min': -1,
            'max': 1,
            'step': 0.05,
            'value': 0
            });
}

function make_input_text(id) {
    return d3.select('#' + id)
    .append('span')
    .attr('class', 'input-text')
    .text(0);
}

// TODO: Find more natural OO-way of structuring the creation of
//       inputs
var input_unemployment = make_input('unemp'),
    input_population = make_input('pop'),
    input_text_unemployment = make_input_text('unemp'),
    input_text_population = make_input_text('pop');

var output_div = d3.select('#outputs')
    .append('div')
    .attr('class', 'output');

var svg = output_div
    .append('svg:svg')
    .attr('width', 400)
    .attr('height', 400)
    .attr('fill-opacity', 1);

var rebias = function(x, y, data, betas) {
    var denom = 1 + x + betas.unemployment*data.unemployment +
                        betas.Population*data.Population;

    var adj_y = y/denom;
    return adj_y;
};

var plot = AdjustablePlot()
            .inputs([{
                'input': input_unemployment,
                'input_text': input_text_unemployment,
                'column': 'unemployment'
            },
            {
                'input': input_population,
                'input_text': input_text_population,
                'column': 'Population'
            }])
            .adjust(rebias)
            .x('unemployment')
            .y('b01001001');

d3.csv('../data/region_level_acs_crime.csv', function(d) {
    svg.datum(d)
       .call(plot);
});
