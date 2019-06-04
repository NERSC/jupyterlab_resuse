# Installation
Make sure you have dependencies installed, e.g. `conda install jupyterlab nodejs psutil`. 

Then to install the server extension (i.e. the Python part), do:

```pip install -e .```
```jupyter serverextension enable jupyterlab_resuse```

(I am aware I should be more consistent in choosing between the hyphen and the underscore, i.e. `jupyterlab-resuse` and `jupyterlab_resuse`. I myself have forgotten where one is used and where the other is used.)

To install the lab extension (i.e. the TypeScript part), do:

```jlpm install```
```jlpm run build```
```jupyter labextension install .```

This should be sufficient for a development install too; if you want to update after changing the TypeScript code you can run `jupyter lab build`.

[This page](https://jupyterlab.readthedocs.io/en/stable/developer/extension_dev.html) also has recommendations about how to use `jupyter lab --watch` or `jupyter labextension link .` during development.

Basically a modification of [nbresuse](https://github.com/yuvipanda/nbresuse), with inspiration from [jupyterlab-slurm](https://github.com/NERSC/jupyterlab-slurm) (which I also contributed to). Chart.js documentation and [examples](https://www.chartjs.org/samples/latest/) were helpful as well.