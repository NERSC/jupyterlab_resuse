"""JupyterLab Resuse : view and manage resource usage from JupyterLab tab """

from .resuse import MetricsHandler
from notebook.utils import url_path_join

__version__="0.1.1"

def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterlab_resuse"
        }]
        
def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    print('jupyterlab_resuse server extension loaded')
    web_app = nb_server_app.web_app
    host_pattern = '.*$'

    base_url = web_app.settings['base_url']

    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, '/resuse'), MetricsHandler)
        ])

