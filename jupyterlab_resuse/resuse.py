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

        for process in all_processes:
            app_log.info("this process has name %s", process.name())

        total_mem = psutil.virtual_memory().total        

        used_mem = psutil.virtual_memory().used
        app_log.info("used mem is %s", used_mem)

        rss = sum([p.memory_info().rss for p in all_processes])
        app_log.info("rss is %s", rss) 

        cpu_percent = sum([p.cpu_percent(interval=0.1) for p in all_processes])

        num_users = len(psutil.users())
        app_log.info("num_users is %s", num_users)
        users = psutil.users()
        app_log.info("users is %s", str(users))

        metrics = {
            'rss': rss,
            'total_mem': total_mem,
            'cpu_percent': cpu_percent,
            'used_mem': used_mem,
            'num_users': num_users,
            'users' : users,
        }
        self.write(json.dumps(metrics))
