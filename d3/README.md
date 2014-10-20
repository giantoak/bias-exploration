#AdjustablePlot

AdjustablePlot.js is a reusable d3 plot that takes in an adjustment function and an input DOM element, then applies the adjustment whenever the input triggers an onChange event.

Here are all of its options

```javascript
var plot = AdjustablePlot()
            .x(null)                // (required) string, name of the column on the X axis
            .y(null)                // (required) string, name of column on the Y axis
            .input([                // (optional) list of objects, containing:
            {
                'input': <d3 selection of an HTML input element>,
                'input_text': <d3 selection of an associated HTML text element>,
                'column': <(string) name of column>
            },
            {..},..
            ])            
            .adjust(null)           // (optional) reference to a function that adjusts the chart
            .width(400)             // (optional) width in pixels
            .height(400)            // (optional) height in pixels
            .padding({              // (optional) padding on all sides
                'left': 50, 
                'right': 50, 
                'top'; 50, 
                'bottom': 50
            })
            .alpha(1)              // (optional) opacity of scatter circles
            .radius(2)              // (optional) radius of scatter circles
```

The adjust function must take the `x`, `y`, `data`, and `betas` arguments. The data object contains references to all of the control variables named in `inputs`, and `betas` contains their corresponding sliders. A plot that wishes to implement `adjust` must also implement `inputs`, name a `column`, and optionally have an `input_text`. A sample adjustment function that reweights the plot based off of sliders for unemployment and populatoin variables looks as follows:

```javascript
var rebias = function(x, y, data, betas) {
    var denom = 1 + x + betas.unemployment*data.unemployment +
        betas.Population*data.Population;

    var adj_y = y/denom;
    return adj_y;
};

var plot = AdjustablePlot()
            .inputs([
            {
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

```
