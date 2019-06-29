import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  PageConfig, URLExt
} from '@jupyterlab/coreutils';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  JSONExt
} from '@phosphor/coreutils';

import {
  Widget
} from '@phosphor/widgets';

import {
  Chart
} from 'chart.js';

import 'chartjs-plugin-annotation';

import '../style/index.css';

class resuseWidget extends Widget {

  constructor() {
    super();

    this.id = 'jupyterlab-resuse';
    this.title.label = 'Resource Usage';
    this.title.closable = true;
    this.addClass('jp-resuseWidget');

    this.chart = document.createElement("canvas");
    this.chart.className ='jp-resuseChart';
    this.node.appendChild(this.chart);

    this.text = document.createElement("div");
    this.text.className = 'jp-resuseDescription';
    this.node.appendChild(this.text);

  }

  public chart: HTMLCanvasElement;
  public text: HTMLElement;
};
 
function activate(
    app: JupyterLab,
    palette: ICommandPalette,
    restorer: ILayoutRestorer
  ) {
  // Create a single widget
  // let widget: resuseWidget = new resuseWidget();
  let widget: resuseWidget;

  let baseUrl = PageConfig.getOption('baseUrl');
  let endpoint = URLExt.join(baseUrl, "/resuse");

  function displayMetrics() {

    fetch(endpoint).then(response => {
    return response.json();
  }).then(data => {
    let usedMb = (Math.round(data['rss'] / (1024 * 1024)));
    let totalMem = (Math.round(data['total_mem'] / (1024 * 1024)));
    let cpuPct = (data['cpu_percent']);
    let systemUsedMem = (Math.round(data['used_mem'] / (1024 * 1024)));
    let numUsers = data['num_users'];
    let users = data['users'];
    let num_labhub = data['num_labhub'];


    let memoryLine = usedMb.toString() + ' MB used out of ' + totalMem.toString() + ' MB total';
    let cpuLine = 'CPU: ' + cpuPct.toString() + '% of a single processor';
    let usedMemLine = systemUsedMem.toString() + ' MB used everywhere on the system out of ' + totalMem.toString() + ' MB total';
    let numUsersLine = numUsers.toString() + ' users currently using the system' 
    let usersLine = users.toString() + ' is what "users" variable looks like'
    let labhubLine = num_labhub.toString() + ' is what "num_labhub" variable looks like'

    widget.text.innerText = memoryLine + '\n' + cpuLine + '\n' + usedMemLine + '\n' + numUsersLine + '\n' + usersLine + '\n' + labhubLine;

    let values = {"labels":["Memory Usage", "CPU Usage"], 
    "datasets": [{"label":"Resource Usage", "data":[usedMb/totalMem*100, cpuPct], 
    "backgroundColor": ['rgb(255, 159, 64)', 'rgb(54, 162, 235)']}] };

    let options = {"scales": {"yAxes":[{"scaleLabel":{"display": true, "labelString": "Percentage"}, 
    "ticks": {"min": 0, "max": 100}}]}, "title": {"display": true, "text": "Resource Usage"},  
    "animation":{"duration":0}, "events":[], "legend":{"display": false},
     "annotation":{"annotations":[{"type":"line", "mode":"horizontal", "value": 50,
           "scaleID":"y-axis-0", "borderColor":"rgb(75, 192, 192)",
            "borderWidth":4, "label": {"enabled": true, "content": "Target for maximum individual usage"} }]}};

    let myChart = new Chart(widget.chart, {
      "type": 'bar',    
      "data": values,
      "options": options,
    });
    // otherwise TypeScript complains that the variable myChart isn't used
    console.log(myChart);
  });

  }

  setInterval(displayMetrics, 1000);

  // Add an application command
  const command: string = 'resuse:open';
  app.commands.addCommand(command, {
    label: 'Resource usage',
    execute: () => {
      if (!widget) {
        widget = new resuseWidget();
        widget.update();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.addToMainArea(widget);
      } else {
        widget.update();
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({command, category: 'HPC Tools'});

  let tracker = new InstanceTracker<resuseWidget>({ "namespace": "resuse"});
  restorer.restore(tracker, {
    command,
    "args": () => JSONExt.emptyObject,
    "name": () => 'resuse'
  });

}; // activate

/**
 * Initialization data for the jupyterlab_resuse extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_resuse',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate };

  export default extension;
