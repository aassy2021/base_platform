# 底座核心架构设计
from .resource_pool import ResourcePool
from .project_manager import ProjectManager
from .worker_manager import WorkerManager

class BaseCore:
    """底座核心 - 管理项目和数字员工的基础设施"""
    
    def __init__(self):
        self.resource_pool = ResourcePool()
        self.project_manager = ProjectManager()
        self.worker_manager = WorkerManager()
