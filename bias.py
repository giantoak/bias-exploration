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

class ScatterBias(object):
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
        cols = {'x': 'Robbery', 
                'y': 'Violent crime total',
                'ctrl': 'Population'
                }
        df2= df.ix[:, cols.values()]
        df2.dropna(axis=0, inplace=True)

        source = ColumnDataSource(df2)

        ##############################
        ## draw scatterplot
        ##############################

        bk.figure()
        sc = bk.scatter(x=cols['x'], y=cols['y'], source=source)

        ##############################
        ## get renderer data source
        ##############################

        renderer = [r for r in bk.curplot().renderers if isinstance(r, Glyph)][0]
        self.ds = renderer.data_source

        ##############################
        ## initiate slider
        ##############################
        beta = .5
        slider = bkw.Slider(start=1, end=100, value=beta, step=1, 
                title='Population Beta')
        slider.on_change('value', self.on_slider_change)


        ##############################
        ## setup layout
        ##############################

        layout = bkw.VBox(children=[sc, slider])
        self.document.add(layout)

        ##############################
        ## link plot with session with document
        ##############################
        self.session.store_document(self.document)
        link = self.session.object_link(self.document.context)
        view(link)
        self.session.poll_document(self.document)

    # bokeh.output_server
    # bokeh.plotting.scatter
    # pandas.DataFrame.rename
    def update_data(self, amt):
        #TODO: change this from random.random
        self.ds.data['Population'] = [x*np.random.random() for x in 
                self.ds.data['Population']]
        #session.store_objects(source)
        self.session.store_document(self.document)
        print('Update data: ', amt)

    def on_slider_change(self, obj, attr, old, new):
        print('Slider changed: ', new)
        self.update_data(new/100.0)
    

if __name__ == '__main__':
    sb = ScatterBias()
