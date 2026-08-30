# 资源池管理
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Resource:
    """资源定义"""
    cpu_cores: int
    memory_mb: int
    disk_mb: int

class ResourcePool:
    """底座资源池 - 为项目提供运行依赖和环境"""
    
    def __init__(self):
        self.system_resources = self._get_system_resources()
        self.allocated = {}
        
    def _get_system_resources(self) -> Resource:
        """获取系统资源"""
        try:
            import psutil
            return Resource(
                cpu_cores=psutil.cpu_count(),
                memory_mb=psutil.virtual_memory().total // (1024 * 1024),
                disk_mb=psutil.disk_usage('/').total // (1024 * 1024)
            )
        except ImportError:
            # 如果没有 psutil，使用默认值
            return Resource(cpu_cores=4, memory_mb=8192, disk_mb=500000)
        
    def allocate_env(self, dependencies: List[str]) -> Dict[str, Any]:
        """为项目分配运行环境"""
        env_id = f"env_{len(self.allocated) + 1}"
        env = {
            'id': env_id,
            'dependencies': dependencies,
            'python_path': self._setup_python_env(dependencies),
            'resource_limits': self._calculate_limits()
        }
        self.allocated[env_id] = env
        return env
        
    def _setup_python_env(self, dependencies: List[str]) -> str:
        """设置Python环境路径"""
        return f"/envs/{hash(tuple(dependencies))}"
        
    def _calculate_limits(self) -> Dict[str, int]:
        """计算资源限制"""
        allocated_count = len(self.allocated)
        if allocated_count == 0:
            return {'cpu_percent': 100, 'memory_mb': self.system_resources.memory_mb // 2}
        else:
            return {
                'cpu_percent': max(10, 80 // allocated_count),
                'memory_mb': max(256, self.system_resources.memory_mb // (allocated_count + 1))
            }
            
    def deallocate_env(self, env_id: str):
        """释放环境"""
        if env_id in self.allocated:
            del self.allocated[env_id]
            
    def get_status(self) -> Dict[str, Any]:
        """获取资源池状态"""
        return {
            'system': {
                'cpu_cores': self.system_resources.cpu_cores,
                'memory_mb': self.system_resources.memory_mb,
                'disk_mb': self.system_resources.disk_mb
            },
            'allocated_environments': len(self.allocated),
            'environments': self.allocated
        }
