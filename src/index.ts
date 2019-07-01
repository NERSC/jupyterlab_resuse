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

    this.chartDiv = document.createElement("div");
    this.chartDiv.className = 'jp-resuseChartDiv';
    this.node.appendChild(this.chartDiv);

    this.memChartContainer = document.createElement("div");
    this.memChartContainer.className = 'jp-resuseChartContainer'
    this.chartDiv.appendChild(this.memChartContainer);

    this.memChart = document.createElement("canvas");
    this.memChart.className = 'jp-resuseChart';
    this.memChartContainer.appendChild(this.memChart);

    this.cpuChartContainer = document.createElement("div");
    this.cpuChartContainer.className = 'jp-resuseChartContainer';
    this.chartDiv.appendChild(this.cpuChartContainer);

    this.cpuChart = document.createElement("canvas");
    this.cpuChart.className = 'jp-resuseChart';
    this.cpuChartContainer.appendChild(this.cpuChart);

    this.text = document.createElement("div");
    this.text.className = 'jp-resuseDescription';
    this.node.appendChild(this.text);

  }

  private chartDiv: HTMLDivElement;
  private memChartContainer: HTMLDivElement;
  private cpuChartContainer: HTMLDivElement;

  public memChart: HTMLCanvasElement;
  public cpuChart: HTMLCanvasElement;
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
    let userUsedMem = (Math.round(data['rss'] / (1024 * 1024)));
    let systemUsedMem = (Math.round(data['used_mem'] / (1024 * 1024)));
    let totalMem = (Math.round(data['total_mem'] / (1024 * 1024)));

    let cpuPct = Math.round(data['cpu_percent']);

    let num_labhub = data['num_labhub'];

    let targetMemPct = 100/num_labhub;

    let memoryLine = userUsedMem.toString() + ' MB used by Jupyter out of ' + totalMem.toString() + ' MB total';
    let usedMemLine = systemUsedMem.toString() + ' MB used everywhere on the system out of ' + totalMem.toString() + ' MB total';
    let cpuLine = 'CPU: ' + cpuPct.toString() + '% of a single processor';
    let labhubLine = num_labhub.toString() + ' users currently using the system'

    widget.text.innerText = memoryLine + '\n' + usedMemLine + '\n' + cpuLine + '\n' + labhubLine;

    let memValues = {"labels":["total usage"], 
    "datasets": [{"label":"your usage", "data":[userUsedMem/totalMem*100], 
    "backgroundColor": ['rgb(220, 20, 60)']},
    {"label": "others' usage", "data":[(systemUsedMem - userUsedMem)/totalMem*100],
      "backgroundColor":['rgb(105,105, 105)']}] };

    let cpuValues = {"labels":[], 
    "datasets": [{"label":"", "data":[cpuPct],
    "backgroundColor": ['rgb(54, 162, 235)']}] };

    let memOptions = {"scales": {"xAxes":[{"stacked": true}], "yAxes":[{"stacked": true, "scaleLabel":{"display": true, "labelString": "Percentage"}, 
    "ticks": {"min": 0, "max": 100}}]}, "title": {"display": true, "text": "Memory Usage"},  
    "animation":{"duration":0}, "events":[], "legend":{"display": true},
     "annotation":{"annotations":[{"type":"line", "mode":"horizontal", "value": targetMemPct,
           "scaleID":"y-axis-0", "borderColor":"rgb(75, 192, 192)",
            "borderWidth":4, "label": {"enabled": true, "content": "Suggested maximum individual usage"} }]}};

    let cpuOptions = {"scales": {"yAxes":[{"scaleLabel":{"display": true, "labelString": "Percentage"}, 
    "ticks": {"min": 0, "max": 100}}]}, "title": {"display": true, "text": "CPU Usage"},  
    "animation":{"duration":0}, "events":[], "legend":{"display": false}};

    let memChart = new Chart(widget.memChart, {
      "type": 'bar',    
      "data": memValues,
      "options": memOptions,
    });
    let cpuChart = new Chart(widget.cpuChart, {
      "type" : 'bar',
      "data" : cpuValues,
      "options": cpuOptions,
    });
    // otherwise TypeScript complains that the variable myChart isn't used
    console.log(memChart, cpuChart);
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
