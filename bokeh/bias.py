from __future__ import print_function

import time

import numpy as np

import bokeh.plotting as bk

from bokeh.browserlib import view
from bokeh.document import Document
from bokeh.glyphs import Line
from bokeh.objects import (
    Plot, DataRange1d, LinearAxis,
    ColumnDataSource, Glyph, PanTool, WheelZoomTool
)
from bokeh.session import Session

from bokeh import widgets as bkw

import pandas as pd
import time
from pprint import pprint

class ScatterBias(object):
    maxval = 1000.0
    own_update = False

    def __init__(self):
        ##############################
        ## load Bokeh page
        ##############################

        bk.output_server('bias_scatter_demo')
        self.document = Document()
        self.session = Session()
        self.session.use_doc('bias_scatter_demo')
        self.session.load_document(self.document)

        ##############################
        ## load DataFrame
        ##############################
        df = pd.read_csv('data/crime2013_tagged_clean.csv', index_col='full_name')
        self.cols = {'x': 'Robbery', 
                'y': 'Violent crime total',
                'pop': 'Population'
                }

        cols = self.cols

        df2= df.ix[:, cols.values()]
        df2.dropna(axis=0, inplace=True)

        self.df0 = df2.copy()

        source = ColumnDataSource(df2)

        ##############################
        ## draw scatterplot
        ##############################

        bk.figure(x_axis_label=cols['x'],
                y_axis_label=cols['y'],
                title='Bias Adjusted %s by %s'%(cols['y'], cols['pop']))
        sc = bk.scatter(x=cols['x'], y=cols['y'], source=source)

        ##############################
        ## get renderer data source
        ##############################

        renderer = [r for r in bk.curplot().renderers if isinstance(r, Glyph)][0]
        self.ds = renderer.data_source

        ##############################
        ## initiate textbox + slider
        ##############################
        self.widgets = []
        default_val = 0

        text = bkw.TextInput(
                value=str(default_val), 
                title='Population Beta:')
        text.on_change('value', self.on_text_change)
        
        slider = bkw.Slider(
                start=-self.maxval, 
                end=self.maxval, 
                value=default_val, 
                step=1, 
                title='Population Beta')
        slider.on_change('value', self.on_slider_change)

        self.widgets.append(text)
        self.widgets.append(slider)

        ##############################
        ## setup layout
        ##############################
        inputs = bkw.HBox(children=[text, slider])
        layout = bkw.VBox(children=[sc, inputs])
        self.document.add(layout)

        ##############################
        ## link plot with session with document
        ##############################
        self.session.store_document(self.document)
        link = self.session.object_link(self.document.context)
        view(link)
        self.session.poll_document(self.document, interval=.5)

    def update_data(self, val):
        amt = val/self.maxval
        import time
        #TODO: change this from random.random
        c = self.cols
        t0 = time.time()

        #old_ys = self.ds.data[c['y']][:]
        self.ds.data[c['y']] = [ 
                row[c['y']]/
                (1 + row[c['x']] + amt*row[c['pop']])
            for i, row in self.df0.iterrows()]
        

        self.session.store_objects(self.ds)
        self.session.store_document(self.document)
        t1 = time.time()
        print(t1-t0)
        
        # for seeing how much changed:
        #for i in range(len(old_ys)):
        #    print(i, self.ds.data[c['pop']][i], self.ds.data[c['y']][i] - 
        #           old_ys[i])

    def on_slider_change(self, obj, attr, old, new):
        self.update_data(new)
    
    def on_text_change(self, obj, attr, old, new):
        try:
            n = int(new)
            n = max(n, -self.maxval)
            n = min(n, self.maxval)

            self.update_data(n)
        except ValueError:
            return

if __name__ == '__main__':
    sb = ScatterBias()
