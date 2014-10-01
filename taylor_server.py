# annotated version of taylor series bokeh server

from __future__ import print_function

import time

import numpy as np
import sympy as sy

from bokeh.browserlib import view
from bokeh.document import Document
from bokeh.glyphs import Line
from bokeh.objects import Plot, DataRange1d, LinearAxis, ColumnDataSource, Grid, Legend
from bokeh.session import Session
from bokeh.widgets import Slider, TextInput, HBox, VBox, Dialog

document = Document()
session = Session()
session.use_doc('taylor_server')
session.load_document(document)

# I'm not famliiar with sympy, but I know it's a symbolic math library
# This is where the default variable and expression is defined:
xs = sy.Symbol('x')
expr = sy.exp(-xs)*sy.sin(xs)
order = 1

# This calculates the Taylor series at a given xs using the function fx
def taylor(fx, xs, order, x_range=(0, 1), n=200):
    x0, x1 = x_range
    x = np.linspace(float(x0), float(x1), n)

    fy = sy.lambdify(xs, fx, modules=['numpy'])(x)
    tx = fx.series(xs, n=order).removeO()

    if tx.is_Number:
        ty = np.zeros_like(x)
        ty.fill(float(tx))
    else:
        ty = sy.lambdify(xs, tx, modules=['numpy'])(x)

    return x, fy, ty

# This updates certain global variables with the results from the taylor series
def update_data():
    # in bias correction, this would be calculating the new responses given
    # coefficients in the sliders
    x, fy, ty = taylor(expr, xs, order, (-2*sy.pi, 2*sy.pi), 200)

    # changes plot title
    plot.title = "%s vs. taylor(%s, n=%d)" % (expr, expr, order)

    # changes plot legends
    legend.legends = {
        "%s"         % expr: [line_f_glyph],
        "taylor(%s)" % expr: [line_t_glyph],
    }

    # changes the data used in the graph;
    source.data = dict(x=x, fy=fy, ty=ty)
    slider.value = order

    session.store_document(document)

# this is the source variable that update_data modifies
# perhaps we'll move things into a ColumnDataStore; I'm not sure yet.
source = ColumnDataSource(data=dict(x=[], fy=[], ty=[]))

xdr = DataRange1d(sources=[source.columns("x")])
ydr = DataRange1d(sources=[source.columns("fy")])

plot = Plot(x_range=xdr, y_range=ydr, plot_width=800, plot_height=400)

line_f = Line(x="x", y="fy", line_color="blue", line_width=2)
line_f_glyph = plot.add_glyph(source, line_f)
plot.add_layout(line_f_glyph)

line_t = Line(x="x", y="ty", line_color="red", line_width=2)
line_t_glyph = plot.add_glyph(source, line_t)
plot.add_layout(line_t_glyph)

xaxis = LinearAxis()
plot.add_layout(xaxis, 'below')

yaxis = LinearAxis()
plot.add_layout(yaxis, 'left')

xgrid = Grid(dimension=0, ticker=xaxis.ticker)
ygrid = Grid(dimension=1, ticker=yaxis.ticker)

legend = Legend(orientation="bottom_left")
plot.add_layout(legend)

def on_slider_value_change(obj, attr, old, new):
    global order
    order = int(new)
    update_data()

def on_text_value_change(obj, attr, old, new):
    try:
        global expr
        expr = sy.sympify(new, dict(x=xs))
    except (sy.SympifyError, TypeError, ValueError) as exception:
        dialog.content = str(exception)
        dialog.visible = True
        session.store_objects(dialog)
    else:
        update_data()

dialog = Dialog(title="Invalid expression", buttons=["Close"])

# this is the Slider object. We'll have to think about sane defaults and 
# step-size.
slider = Slider(start=1, end=20, value=order, step=1, title="Order:")

# on change, recalculate coefficients. Let's start with doing this
# completely client-side, because then it would be faster to demo (I think).
# That also encourages us to think about responsiveness. What we want
# might be too sensitive to relay back and forth between client and server.
# That said, perhaps certain values could be precomputed on the server,
# sent over, and cached.
slider.on_change('value', on_slider_value_change)

# This is a useful way to allow two UI objects to control the same underlying
# data
text = TextInput(value=str(expr), title="Expression:")
text.on_change('value', on_text_value_change)

# TODO: Look up how HBox and VBox arrange elements on the page.
# It looks like this is fairly central to the layout engine of Bokeh.
# My intelligent guess is that the slider and text are placed side by side,
# and then the combo slider-text are placed vertically in line with plot + 
# dialog
inputs = HBox(children=[slider, text])
layout = VBox(children=[inputs, plot, dialog])

document.add(layout)

# draws data for the first time
update_data()

# this links up the script with the bokeh server.
if __name__ == "__main__":
    link = session.object_link(document.context)
    print("Please visit %s to see the plots" % link)
    view(link)
    print("\npress ctrl-C to exit")
    session.poll_document(document)
