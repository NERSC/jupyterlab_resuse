import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
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

  
function activate(
    app: JupyterLab,
    palette: ICommandPalette,
    restorer: ILayoutRestorer
  ) {
  // Create a single widget
  let widget: Widget = new Widget();
  widget.id = 'jupyterlab-resuse';
  widget.title.label = 'Resource Usage';
  widget.title.closable = true;

  //this.chart = document.createElement("canvas");


  let text = document.createElement("div");
  widget.node.appendChild(text);


    let baseUrl = PageConfig.getOption('baseUrl');
    let endpoint = URLExt.join(baseUrl, "/resuse");
  
  

  function displayMetrics() {

    fetch(endpoint).then(response => {
    return response.json();
  }).then(data => {
    let usedMb = (Math.round(data['rss'] / (1024 * 1024))).toString();
    let totalMem = (Math.round(data['total_mem'] / (1024 * 1024))).toString();
    let cpuPct = (data['cpu_percent']).toString();
    let memoryLine = usedMb + ' MB used out of ' + totalMem + ' MB total';
    let cpuLine = 'CPU: ' + cpuPct + '% of a single processor';
    text.innerText = memoryLine + '\n' + cpuLine;
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

} // activate

/**
 * Initialization data for the jupyterlab_resuse extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_resuse',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activate };

  export default extension;