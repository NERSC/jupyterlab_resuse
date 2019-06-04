import json
import os
import psutil

from traitlets import Float, Int, default
from traitlets.config import Configurable

from notebook.base.handlers import IPythonHandler

class MetricsHandler(IPythonHandler):
    def get(self):
        """
        Calculate and return current resource usage metrics
        """
        cur_process = psutil.Process()
        all_processes = [cur_process] + cur_process.children(recursive=True)

        total_mem = psutil.virtual_memory()[0]
        
        rss = sum([p.memory_info().rss for p in all_processes])
        cpu_percent = sum([p.cpu_percent(interval=0.1) for p in all_processes])

        metrics = {
            'rss': rss,
            'total_mem': total_mem,
            'cpu_percent': cpu_percent,
        }
        self.write(json.dumps(metrics))