function biasScatter() {
    var dims = {'width': 500,
        'height': 500};

    function width(w) {
        dims['width'] = w;
    }
    // .........
    //  more getters and setters
    // ........

    function genChart(selection) {
        selection.each(function (d, i) {
            // generate chart 
            // use "this" as container
        });
    }
    return genChart;
}

// to draw chart:

var chart = biasScatter()
    .width(500)
    //.. additional properties

d3.csv(file, function(d) {
    d3.select("#svg")
        .datum(d)
        .call(chart);
});
