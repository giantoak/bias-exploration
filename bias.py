"""
This app gives users visual control over bias in data, by hand-tuning 
lurking coefficients.

It was made by Sam Zhang, Jeff Borowitz, and Jake Shapiro for Giant Oak 
as part of the Darpa Memex project.
"""
from __future__ import print_function
import logging
logging.basicConfig(level=logging.DEBUG)

import pandas as pd
from bokeh import widgets as bkw
from bokeh.plotting import scatter
from bokeh.properties import Instance, Dict, String
from bokeh.server.app import bokeh_app
from bokeh.server.utils.plugins import object_page
from bokeh.objects import Plot, ColumnDataSource

class ScatterBias(bkw.HBox):
    extra_generated_classes = [['ScatterBias', 'ScatterBias', 'HBox']]
    maxval = 100.0
    
    inputs = Instance(bkw.VBoxForm)
    outputs = Instance(bkw.VBoxForm)
    plots = Dict(String, Instance(Plot))
    source = Instance(ColumnDataSource)
    

    cols = list()
    widgets = dict()
    # unmodified source
    df0 = None

    @classmethod
    def create(cls):
        obj = cls()

        ##############################
        ## load DataFrame
        ##############################
        df = pd.read_csv('data/crime2013_tagged_clean.csv', index_col='full_name')
        obj.cols = {'x': 'Robbery', 
                'y': 'Violent crime total',
                'pop': 'Population'
                }
        
        cols = obj.cols

        # only keep interested values
        df2= df.ix[:, cols.values()]

        # drop empty rows
        df2.dropna(axis=0, inplace=True)

        obj.df0 = df2.copy()
        obj.df0.reset_index(inplace=True)
        # keep copy of original data
        obj.source = ColumnDataSource(df2)

        ##############################
        ## draw scatterplot
        ##############################

        obj.plots = {
                'robbery': scatter(x=cols['x'], 
                    y=cols['y'], 
                    source=obj.source,
                    x_axis_label=cols['x'],
                    y_axis_label=cols['y'],
                    title='%s by %s, Adjusted by by %s'%(cols['y'], 
                        cols['x'], cols['pop'])),
                'pop': scatter(x=cols['pop'], 
                    y=cols['y'], 
                    source=obj.source,
                    x_axis_label=cols['pop'],
                    y_axis_label=cols['y'],
                    title='%s by %s, Adjusted by by %s'%(cols['y'], 
                        cols['pop'], cols['pop'])),
            }
        
        obj.update_data()
        ##############################
        ## draw inputs
        ##############################
        # bokeh.plotting.scatter 
        ## TODO: refactor so that any number of control variables are created
        # automatically. This involves subsuming c['pop'] into c['ctrls'], which
        # would be a dictionary mapping column names to their widget titles 
        pop_slider = obj.make_widget(bkw.Slider, dict(
                start=-obj.maxval, 
                end=obj.maxval, 
                value=0, 
                step=1, 
                title='Population'), 
            cols['pop'])

        ##############################
        ## make layout
        ##############################
        obj.inputs = bkw.VBoxForm(
                children=[pop_slider]
                )
        
        obj.outputs = bkw.VBoxForm(
                children=[obj.plots['robbery']]
            )

        obj.children.append(obj.inputs)
        obj.children.append(obj.outputs)
        
        return obj
    
    def make_widget(self, constructor, args, associated_variable):
        """Makes a Widget that gets linked to associated_variable"""
        w = constructor(**args)
        self.widgets.update({associated_variable: w})
        return w

    def setup_events(self):
        super(ScatterBias, self).setup_events()
        logging.debug('setup_events')
        if len(self.widgets) == 0:
            logging.debug(' setup_events, returned')
            return

        for w in self.widgets.itervalues():
            logging.debug(' setting up callback for %s', w)
            w.on_change('value', self, 'input_change')
        logging.debug(' setup_events, success')
        import pdb; pdb.set_trace()

    def update_data(self):
        """Update y by the amount designated by each slider"""
        logging.debug('update_data')
        c = self.cols
        ## TODO:: make this check for bad input; especially with text boxes
        betas = { 
                varname: getattr(widget, 'value')/self.maxval 
                for varname, widget in self.widgets.iteritems()
                }

        ## TODO: Pandas indexing is slow. Make this faster by iterating through
        # df0 down below, and pass in the row as variable
        def debias(ix):
            """ recalculates debiased y for given weights from initial data"""    
            y = self.df0.ix[ix, c['y']]
            denom = 1.0 + sum([
                beta * self.df0.ix[ix, varname] 
                for varname, beta in betas.iteritems()
                            ])

            return y / denom

        #old_ys = self.ds.data[c['y']][:]

        for ix in xrange(len(self.source.data[c['y']])):
            self.source.data[c['y']][ix] = debias(ix)
        

    def input_change(self, obj, attr, old, new):
        logging.debug(
            'Input changed: %s: %d, %d', attr, old, new
        )
        self.update_data()

@bokeh_app.route('/bokeh/bias/')
@object_page('Bias Correction')
def make_object():
    app = ScatterBias.create()
    return app
