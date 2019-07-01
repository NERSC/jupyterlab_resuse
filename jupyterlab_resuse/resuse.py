import json
import os
import psutil

from traitlets import Float, Int, default
from traitlets.config import Configurable

from notebook.base.handlers import IPythonHandler

from tornado.log import app_log

class MetricsHandler(IPythonHandler):
    def get(self):
        """
        Calculate and return current resource usage metrics
        """
        cur_process = psutil.Process()
        all_processes = [cur_process] + cur_process.children(recursive=True)

        total_mem = psutil.virtual_memory().total        

        used_mem = psutil.virtual_memory().used

        rss = sum([p.memory_info().rss for p in all_processes])

        cpu_percent = sum([p.cpu_percent(interval=0.1) for p in all_processes])

        num_users = len(psutil.users())
        users = psutil.users()

        num_labhub = 0
        for process in psutil.process_iter(attrs=["cmdline"]):
            for token in process.info["cmdline"]:
                if "jupyter-labhub" in token:
                    print(process.info["cmdline"])
                    num_labhub += 1
                    break

        metrics = {
            'rss': rss,
            'total_mem': total_mem,
            'cpu_percent': cpu_percent,
            'used_mem': used_mem,
            'num_labhub' : num_labhub,
        }
        self.write(json.dumps(metrics))
