#AdjustablePlot

AdjustablePlot.js is a reusable d3 plot that takes in an adjustment function and an input DOM element, then applies the adjustment whenever the input triggers an onChange event.

Here are all of its options

```javascript
var plot = AdjustablePlot()
            .x(null)                // (required) string, name of the column on the X axis
            .y(null)                // (required) string, name of column on the Y axis
            .ctrl(null)             // (required) string, name of column of control variable
            .input(null)            // (optional) reference to an HTML input element
            .input_text(null)       // (optional) reference an HTML text element associated with the input
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

The adjust function must take the `x`, `y`, `ctrl`, and `beta` arguments. The `beta` variable is a reference to the value of the input slider. A plot that wishes to implement `adjust` must also implement `input`, and optionally `input_text`. A sample adjustment function that reweights the plot based off of the slider's action looks as follows:

```javascript
var rebias = function (x, y, ctrl, beta) {
    var denom = 1 + x + beta*ctrl;
    var adj_y = y / denom;
    return adj_y;
};

var plot = AdjustablePlot()
            .input(input)
            .input_text(input_text)
            .adjust(rebias)
            .x('unemployment')
            .y('b01001001')
            .ctrl('unemployment');

```
