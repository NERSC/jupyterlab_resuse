
import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  PageConfig, URLExt
} from '@jupyterlab/coreutils';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';



/**
 * Initialization data for the jupyterlab_xkcd extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_resuse',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterLab, palette: ICommandPalette) => {
    console.log('JupyterLab extension jupyterlab_xkcd is activated!');

  // Create a single widget
  let widget: Widget = new Widget();
  widget.id = 'jupyterlab-resuse';
  widget.title.label = 'Resource Usage';
  widget.title.closable = true;

  let text = document.createElement("span");
  widget.node.appendChild(text);


    let baseUrl = PageConfig.getOption('baseUrl');
    let endpoint = URLExt.join(baseUrl, "/metrics");
  
  function displayMetrics() {

    fetch(endpoint).then(response => {
    return response.json();
  }).then(data => {
    text.innerText = (Math.round(data['rss'] / (1024 * 1024))).toString() + ' MB';
  });
  }

  setInterval(displayMetrics, 1000);

  // Add an application command
  const command: string = 'resuse:open';
  app.commands.addCommand(command, {
    label: 'Resource usage',
    execute: () => {
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.addToMainArea(widget);
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({command, category: 'HPC Tools'});

  }
};

export default extension;