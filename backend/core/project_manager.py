# 项目容器层设计
from enum import Enum
from typing import Dict, Any
import uuid

class ProjectState(Enum):
    UNMOUNTED = "unmounted"
    MOUNTED = "mounted"
    RUNNING = "running"
    SUSPENDED = "suspended"

class Project:
    """项目容器 - 萝卜插拔机制"""
    
    def __init__(self, project_id: str, config: Dict[str, Any]):
        self.id = project_id or str(uuid.uuid4())
        self.config = config
        self.state = ProjectState.UNMOUNTED
        self.dependencies = config.get('dependencies', [])
        self.runtime_env = {}
        
    def mount(self, base_resource_pool):
        """插入底座 - 安装依赖和环境"""
        self.state = ProjectState.MOUNTED
        self.runtime_env = base_resource_pool.allocate_env(self.dependencies)
        
    def unmount(self):
        """拔出底座 - 释放资源"""
        self.state = ProjectState.UNMOUNTED
        self.runtime_env = {}
        
    def start(self):
        """启动项目"""
        if self.state == ProjectState.MOUNTED:
            self.state = ProjectState.RUNNING
            
    def stop(self):
        """停止项目"""
        if self.state == ProjectState.RUNNING:
            self.state = ProjectState.SUSPENDED

class ProjectManager:
    """项目容器管理器"""
    
    def __init__(self):
        self.projects: Dict[str, Project] = {}
        
    def create_project(self, config) -> str:
        """创建新项目"""
        project = Project(None, config)
        self.projects[project.id] = project
        return project.id
        
    def mount_project(self, project_id: str, resource_pool):
        """将项目插入底座"""
        if project_id in self.projects:
            self.projects[project_id].mount(resource_pool)
            
    def unmount_project(self, project_id: str):
        """将项目从底座拔出"""
        if project_id in self.projects:
            self.projects[project_id].unmount()
