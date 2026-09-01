# 底座平台主程序

import sys
import os
from pathlib import Path

# 添加当前目录到 Python 路径
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import zipfile
import io
import json
from datetime import datetime

# 导入底座核心模块
from core.base_architecture import BaseCore
from core.project_manager import ProjectState
from core.worker_manager import WorkerState

app = FastAPI(
    title="DeepSeeHarness 底座平台 API",
    description="项目插拔和数字员工管理的智能底座",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化底座系统
base_system = BaseCore()

# 数据模型
class ProjectConfig(BaseModel):
    name: str
    dependencies: List[str] = []
    description: str = ""

class WorkerConfig(BaseModel):
    worker_type: str
    capabilities: List[str]

class OfficeAreaConfig(BaseModel):
    slots: List[Dict[str, Any]]

class TaskAssignment(BaseModel):
    worker_id: str
    task: str

# ============ 项目管理 API ============

@app.post("/api/projects")
async def create_project(config: ProjectConfig):
    """创建并插入新项目"""
    project_id = base_system.project_manager.create_project(config.dict())
    base_system.project_manager.mount_project(project_id, base_system.resource_pool)
    return {
        "success": True,
        "project_id": project_id,
        "message": f"项目 '{config.name}' 已成功插入底座"
    }

@app.get("/api/projects")
async def list_projects():
    """获取所有项目列表"""
    projects = []
    for pid, project in base_system.project_manager.projects.items():
        projects.append({
            "id": pid,
            "name": project.config.get('name', '未命名项目'),
            "state": project.state.value,
            "dependencies": project.dependencies,
            "description": project.config.get('description', '')
        })
    return {"projects": projects}

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """获取特定项目详情"""
    project = base_system.project_manager.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return {
        "id": project.id,
        "name": project.config.get('name', '未命名项目'),
        "state": project.state.value,
        "dependencies": project.dependencies,
        "description": project.config.get('description', '')
    }

@app.post("/api/projects/import")
async def import_project_zip(file: UploadFile = File(...)):
    """导入 zip 压缩包作为项目"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="只支持 .zip 格式")

    try:
        content = await file.read()
        zip_buffer = io.BytesIO(content)

        project_name = file.filename.replace('.zip', '')
        description = ''
        dependencies = []
        file_list = []

        with zipfile.ZipFile(zip_buffer, 'r') as zf:
            # 列出所有文件
            file_list = zf.namelist()

            # 尝试从项目配置文件读取元数据
            config_names = ['project.json', 'config.json', 'package.json', 'setup.py', 'pyproject.toml']
            for name in file_list:
                basename = name.split('/')[-1]
                if basename == 'project.json':
                    try:
                        data = json.loads(zf.read(name))
                        project_name = data.get('name', project_name)
                        description = data.get('description', '')
                        dependencies = data.get('dependencies', [])
                    except Exception:
                        pass
                elif basename == 'package.json':
                    try:
                        data = json.loads(zf.read(name))
                        project_name = data.get('name', project_name) or project_name
                        description = data.get('description', '') or description
                        dependencies = list(data.get('dependencies', {}).keys())
                    except Exception:
                        pass

        # 创建项目
        project_id = base_system.project_manager.create_project({
            'name': project_name,
            'description': description or f'从 {file.filename} 导入',
            'dependencies': dependencies,
            'zip_file': file.filename,
            'file_count': len(file_list)
        })
        base_system.project_manager.mount_project(project_id, base_system.resource_pool)

        return {
            "success": True,
            "project_id": project_id,
            "name": project_name,
            "file_count": len(file_list),
            "message": f"项目 '{project_name}' 已从 {file.filename} 导入"
        }
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="无效的 zip 文件")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """从底座拔出项目"""
    if project_id not in base_system.project_manager.projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    base_system.project_manager.unmount_project(project_id)
    del base_system.project_manager.projects[project_id]
    return {"success": True, "message": "项目已从底座拔出"}

@app.post("/api/projects/{project_id}/start")
async def start_project(project_id: str):
    """启动项目"""
    project = base_system.project_manager.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    project.start()
    return {"success": True, "message": "项目已启动"}

@app.post("/api/projects/{project_id}/stop")
async def stop_project(project_id: str):
    """停止项目"""
    project = base_system.project_manager.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    project.stop()
    return {"success": True, "message": "项目已停止"}

# ============ 数字员工管理 API ============

@app.post("/api/workers")
async def create_worker(config: WorkerConfig):
    """雇佣新的数字员工"""
    worker_id = base_system.worker_manager.create_worker(config.worker_type, config.capabilities)
    return {
        "success": True,
        "worker_id": worker_id,
        "message": f"数字员工 '{config.worker_type}' 已雇佣"
    }

@app.get("/api/workers")
async def list_workers():
    """获取所有数字员工列表"""
    workers = []
    for wid, worker in base_system.worker_manager.workers.items():
        workers.append({
            "id": wid,
            "type": worker.type,
            "state": worker.state.value,
            "capabilities": worker.capabilities,
            "slot": worker.assigned_slot.id if worker.assigned_slot else None,
            "memory_count": len(worker.memory)
        })
    return {"workers": workers}

@app.get("/api/workers/{worker_id}")
async def get_worker(worker_id: str):
    """获取特定员工详情"""
    worker = base_system.worker_manager.workers.get(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="员工不存在")
    return {
        "id": worker.id,
        "type": worker.type,
        "state": worker.state.value,
        "capabilities": worker.capabilities,
        "slot": worker.assigned_slot.id if worker.assigned_slot else None,
        "memory_count": len(worker.memory)
    }

@app.delete("/api/workers/{worker_id}")
async def fire_worker(worker_id: str):
    """解雇数字员工"""
    if worker_id not in base_system.worker_manager.workers:
        raise HTTPException(status_code=404, detail="员工不存在")
    worker = base_system.worker_manager.workers[worker_id]
    worker.remove_from_slot()
    del base_system.worker_manager.workers[worker_id]
    return {"success": True, "message": "员工已解雇"}

# ============ 办公区管理 API ============

@app.post("/api/office")
async def create_office_area(config: OfficeAreaConfig):
    """创建办公区"""
    for slot_config in config.slots:
        base_system.worker_manager.create_slot(slot_config['id'])
    return {
        "success": True,
        "message": f"办公区已创建，包含 {len(config.slots)} 个工位"
    }

@app.get("/api/office")
async def get_office_status():
    """获取办公区状态"""
    office_status = {}
    for sid, slot in base_system.worker_manager.slots.items():
        office_status[sid] = {
            "worker_id": slot.worker.id if slot.worker else None,
            "worker_type": slot.worker.type if slot.worker else None,
            "state": slot.worker.state.value if slot.worker else "empty"
        }
    return {"office": office_status}

@app.post("/api/assign")
async def assign_worker_to_slot(worker_id: str, slot_id: str):
    """将员工分配到工位"""
    worker = base_system.worker_manager.workers.get(worker_id)
    slot = base_system.worker_manager.slots.get(slot_id)
    if not worker:
        raise HTTPException(status_code=404, detail="员工不存在")
    if not slot:
        raise HTTPException(status_code=404, detail="工位不存在")
    base_system.worker_manager.assign_worker_to_slot(worker_id, slot_id)
    return {"success": True, "message": "员工已分配到工位"}

@app.post("/api/release")
async def release_worker(worker_id: str):
    """释放员工从工位"""
    worker = base_system.worker_manager.workers.get(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="员工不存在")
    base_system.worker_manager.release_worker_from_slot(worker_id)
    return {"success": True, "message": "员工已从工位释放"}

# ============ 任务管理 API ============

@app.post("/api/tasks")
async def assign_task(assignment: TaskAssignment):
    """给员工分配任务"""
    worker = base_system.worker_manager.workers.get(assignment.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="员工不存在")
    if worker.state != WorkerState.ACTIVE:
        raise HTTPException(status_code=400, detail="员工不在活跃状态")
    result = worker.execute_task(assignment.task)
    return {
        "success": True,
        "result": result,
        "message": "任务已分配并执行"
    }

# ============ 一键启动 & AI修复 API ============

@app.post("/api/projects/batch-start")
async def batch_start_projects():
    """一键启动所有未运行的项目"""
    results = []
    for pid, project in base_system.project_manager.projects.items():
        if project.state.value != "running":
            project.start()
            results.append({"id": pid, "name": project.config.get('name', ''), "action": "started"})
    return {"success": True, "started_count": len(results), "results": results}

@app.post("/api/projects/{project_id}/ai-fix")
async def ai_fix_project(project_id: str):
    """AI 诊断并修复项目问题"""
    project = base_system.project_manager.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    issues = []
    fixes = []

    # 1. 检查状态: 如果是 unmounted，尝试 mount
    if project.state.value == "unmounted":
        base_system.project_manager.mount_project(project_id, base_system.resource_pool)
        issues.append("项目未安装到底座")
        fixes.append("已自动安装(mount)项目到底座")

    # 2. 检查依赖
    missing_deps = []
    for dep in project.dependencies:
        if dep not in project.runtime_env.get('installed', []):
            missing_deps.append(dep)
    if missing_deps:
        issues.append(f"缺少依赖: {', '.join(missing_deps)}")
        # 模拟安装
        if 'installed' not in project.runtime_env:
            project.runtime_env['installed'] = []
        project.runtime_env['installed'].extend(missing_deps)
        fixes.append(f"已自动安装依赖: {', '.join(missing_deps)}")

    # 3. 如果是 suspended 状态，自动恢复
    if project.state.value == "suspended":
        project.start()
        issues.append("项目处于暂停状态")
        fixes.append("已自动恢复启动")

    # 4. 如果是 mounted 状态但没启动
    if project.state.value == "mounted":
        project.start()
        issues.append("项目已安装但未启动")
        fixes.append("已自动启动项目")

    # 5. 无问题时
    if not issues:
        return {
            "success": True,
            "status": "healthy",
            "message": "项目状态正常，无需修复",
            "issues": [],
            "fixes": []
        }

    return {
        "success": True,
        "status": "fixed",
        "message": f"AI 诊断完成，发现并修复了 {len(issues)} 个问题",
        "issues": issues,
        "fixes": fixes
    }

# ============ 系统监控 API ============

@app.get("/api/system/status")
async def get_system_status():
    """获取系统整体状态"""
    projects = base_system.project_manager.projects
    workers = base_system.worker_manager.workers
    slots = base_system.worker_manager.slots
    
    return {
        "projects": {
            pid: p.state.value for pid, p in projects.items()
        },
        "workers": {
            wid: w.state.value for wid, w in workers.items()
        },
        "slots": {
            sid: (s.worker.id if s.worker else 'empty')
            for sid, s in slots.items()
        }
    }

@app.get("/api/dashboard")
async def get_dashboard_data():
    """获取仪表板数据"""
    projects = base_system.project_manager.projects
    workers = base_system.worker_manager.workers
    slots = base_system.worker_manager.slots
    
    # 统计数据
    active_projects = sum(1 for p in projects.values() if p.state.value == "running")
    active_workers = sum(1 for w in workers.values() if w.state.value == "active")
    empty_slots = sum(1 for s in slots.values() if s.worker is None)
    occupied_slots = len(slots) - empty_slots
    
    return {
        "summary": {
            "total_projects": len(projects),
            "active_projects": active_projects,
            "total_workers": len(workers),
            "active_workers": active_workers,
            "total_slots": len(slots),
            "empty_slots": empty_slots,
            "utilization_rate": round(occupied_slots / len(slots) * 100, 1) if slots else 0
        },
        "recent_activity": [
            {
                "type": "project",
                "action": "mounted",
                "name": p.config.get('name', '未命名'),
                "time": datetime.now().isoformat()
            } for p in list(projects.values())[-3:]
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)