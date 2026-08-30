# 数字员工层设计
from enum import Enum
from typing import Dict, Any, List
import uuid
from datetime import datetime

class WorkerState(Enum):
    IDLE = "idle"           # 空闲工位
    ACTIVE = "active"       # 活跃工作中
    SUSPENDED = "suspended" # 暂停
    TERMINATED = "terminated" # 已销毁

class WorkerSlot:
    """工位/卡槽 - 数字员工的独立空间"""
    
    def __init__(self, slot_id: str):
        self.id = slot_id
        self.worker = None
        self.context_memory = {}   # 独立上下文
        self.workspace = {}        # 工作空间
        
    def assign_worker(self, worker):
        """将员工分配到工位"""
        self.worker = worker
        
    def clear_slot(self):
        """清空工位"""
        self.worker = None
        self.context_memory = {}
        self.workspace = {}

class DigitalWorker:
    """数字员工 - 独立个体"""
    
    def __init__(self, worker_id: str, worker_type: str, capabilities: List[str]):
        self.id = worker_id or str(uuid.uuid4())
        self.type = worker_type
        self.capabilities = capabilities
        self.state = WorkerState.IDLE
        self.assigned_slot: WorkerSlot = None
        self.task_queue = []
        self.memory = []  # 员工记忆
        
    def assign_to_slot(self, slot: WorkerSlot):
        """将员工插入卡槽"""
        self.assigned_slot = slot
        slot.assign_worker(self)
        self.state = WorkerState.ACTIVE
        
    def remove_from_slot(self):
        """从卡槽拔出"""
        if self.assigned_slot:
            self.assigned_slot.clear_slot()
            self.assigned_slot = None
            self.state = WorkerState.IDLE
            
    def execute_task(self, task):
        """执行任务"""
        if self.state == WorkerState.ACTIVE:
            result = self._process(task)
            self.memory.append({
                'task': task,
                'result': result,
                'timestamp': datetime.now()
            })
            return result
            
    def _process(self, task):
        """内部处理逻辑 - 可由子类实现"""
        return f"Task {task} processed by {self.type}"

class WorkerManager:
    """数字员工管理器 - 办公区管理"""
    
    def __init__(self):
        self.workers: Dict[str, DigitalWorker] = {}
        self.slots: Dict[str, WorkerSlot] = {}
        
    def create_slot(self, slot_id: str) -> str:
        """创建新工位/卡槽"""
        slot = WorkerSlot(slot_id)
        self.slots[slot_id] = slot
        return slot_id
        
    def create_worker(self, worker_type: str, capabilities: List[str]) -> str:
        """创建新数字员工"""
        worker = DigitalWorker(None, worker_type, capabilities)
        self.workers[worker.id] = worker
        return worker.id
        
    def assign_worker_to_slot(self, worker_id: str, slot_id: str):
        """将员工分配到指定工位"""
        worker = self.workers.get(worker_id)
        slot = self.slots.get(slot_id)
        if worker and slot:
            worker.assign_to_slot(slot)
            
    def release_worker_from_slot(self, worker_id: str):
        """将员工从工位释放"""
        worker = self.workers.get(worker_id)
        if worker:
            worker.remove_from_slot()
