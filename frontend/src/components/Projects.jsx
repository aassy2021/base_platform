import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, Pause, FolderOpen, Loader2, Upload, FileJson, X, Check, Archive, FileCode } from 'lucide-react'
import axios from 'axios'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', dependencies: '' })
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMode, setImportMode] = useState('zip') // zip 或 json
  const [importData, setImportData] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data.projects)
    } catch (error) {
      setProjects([])
    } finally { setLoading(false) }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/projects', {
        name: newProject.name,
        description: newProject.description,
        dependencies: newProject.dependencies.split(',').map(d => d.trim()).filter(d => d)
      })
      setShowModal(false)
      setNewProject({ name: '', description: '', dependencies: '' })
      fetchProjects()
    } catch (error) {
      alert('创建失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}`)
      setConfirmDeleteId(null)
      fetchProjects()
    } catch (error) {
      alert('删除失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleStartProject = async (projectId) => {
    try {
      await axios.post(`/api/projects/${projectId}/start`)
      fetchProjects()
    } catch (error) {
      alert('启动失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleStopProject = async (projectId) => {
    try {
      await axios.post(`/api/projects/${projectId}/stop`)
      fetchProjects()
    } catch (error) {
      alert('停止失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleImportProject = async () => {
    setImporting(true)
    try {
      if (importMode === 'zip') {
        // ZIP 文件上传
        if (!importFile) {
          alert('请先选择 zip 文件')
          setImporting(false)
          return
        }
        const formData = new FormData()
        formData.append('file', importFile)
        const response = await axios.post('/api/projects/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert(`成功导入项目: ${response.data.name} (${response.data.file_count} 个文件)`)
      } else {
        // JSON 文本导入
        let projectData
        try {
          projectData = JSON.parse(importData)
        } catch (e) {
          alert('JSON格式错误，请检查输入')
          setImporting(false)
          return
        }
        const projectsToImport = Array.isArray(projectData) ? projectData : [projectData]
        for (const proj of projectsToImport) {
          await axios.post('/api/projects', {
            name: proj.name || '导入的项目',
            description: proj.description || '',
            dependencies: proj.dependencies || []
          })
        }
        alert(`成功导入 ${projectsToImport.length} 个项目`)
      }

      setShowImportModal(false)
      setImportData('')
      setImportFile(null)
      fetchProjects()
    } catch (error) {
      alert('导入失败: ' + (error.response?.data?.detail || error.message))
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) setImportFile(file)
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'mounted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'unmounted': return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
      case 'suspended': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default: return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    }
  }

  const getStateLabel = (state) => {
    switch (state) {
      case 'running': return '运行中'
      case 'mounted': return '已安装'
      case 'unmounted': return '未安装'
      case 'suspended': return '已暂停'
      default: return state
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">项目管理</h1>
          <p className="text-dark-400 mt-1">管理插入底座的项目 · 支持 zip 压缩包导入</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg">
            <Upload className="w-5 h-5" /> 导入项目
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> 插入新项目
          </button>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div key={project.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} layout
              className="gradient-border rounded-xl p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><FolderOpen className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-xs text-dark-500 font-mono">{project.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStateColor(project.state)}`}>
                  {getStateLabel(project.state)}
                </span>
              </div>
              <p className="text-dark-300 text-sm mb-4">{project.description || '暂无描述'}</p>
              {project.dependencies && project.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.dependencies.map((dep, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-dark-700 text-dark-300 rounded-md">{dep}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                {project.state === 'running' ? (
                  <button onClick={() => handleStopProject(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                    <Pause className="w-4 h-4" /> 停止
                  </button>
                ) : (
                  <button onClick={() => handleStartProject(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30">
                    <Play className="w-4 h-4" /> 启动
                  </button>
                )}
                {confirmDeleteId === project.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">确认</button>
                    <button onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-2 bg-dark-600 text-dark-300 rounded-lg hover:bg-dark-500 transition-colors text-sm">取消</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(project.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {projects.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FolderOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">暂无项目</p>
            <p className="text-dark-500 text-sm mt-1">点击「导入项目」上传 zip 压缩包，或「插入新项目」手动创建</p>
          </div>
        )}
      </div>

      {/* 创建项目弹窗 */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 w-full max-w-md border border-dark-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">插入新项目</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">项目名称 *</label>
                  <input type="text" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">项目描述</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all" rows="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">依赖项 (逗号分隔)</label>
                  <input type="text" value={newProject.dependencies} onChange={(e) => setNewProject({...newProject, dependencies: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="flask, sqlalchemy, pandas" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all">取消</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">插入项目</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 导入项目弹窗 */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 w-full max-w-lg border border-dark-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">导入项目</h2>
                <button onClick={() => { setShowImportModal(false); setImportFile(null); setImportData('') }}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 导入模式选择 */}
              <div className="flex gap-3 mb-6">
                <button onClick={() => { setImportMode('zip'); setImportFile(null) }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all ${
                    importMode === 'zip'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600'
                  }`}>
                  <Archive className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">ZIP 压缩包</div>
                    <div className="text-xs opacity-70">上传完整项目文件夹</div>
                  </div>
                </button>
                <button onClick={() => { setImportMode('json'); setImportFile(null) }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all ${
                    importMode === 'json'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600'
                  }`}>
                  <FileJson className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">JSON 配置</div>
                    <div className="text-xs opacity-70">粘贴项目元数据</div>
                  </div>
                </button>
              </div>

              {/* ZIP 文件导入 */}
              {importMode === 'zip' && (
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-dark-600 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    {importFile ? (
                      <div className="text-center">
                        <Archive className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-white font-medium">{importFile.name}</p>
                        <p className="text-sm text-dark-400 mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-blue-400 mt-2">点击重新选择</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-10 h-10 text-dark-500 mb-3 group-hover:text-blue-400 transition-colors" />
                        <p className="text-dark-300">点击选择或拖拽 zip 文件</p>
                        <p className="text-xs text-dark-500 mt-1">支持 .zip 格式，自动识别 package.json / project.json</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
                  <div className="p-3 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-xs text-dark-400">
                      <strong className="text-dark-300">提示：</strong> zip 内若包含 <code className="text-blue-400">package.json</code> 或 <code className="text-blue-400">project.json</code>，将自动提取项目名称和依赖信息
                    </p>
                  </div>
                </div>
              )}

              {/* JSON 文本导入 */}
              {importMode === 'json' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">粘贴项目 JSON 数据</label>
                    <textarea value={importData} onChange={(e) => setImportData(e.target.value)}
                      className="w-full h-40 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder={`[\n  {\n    "name": "项目名称",\n    "description": "项目描述",\n    "dependencies": ["dep1", "dep2"]\n  }\n]`} />
                  </div>
                  <div className="p-3 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-xs text-dark-400">
                      <strong className="text-dark-300">格式说明：</strong> 支持单个对象或对象数组，包含 name、description、dependencies 字段
                    </p>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowImportModal(false); setImportData(''); setImportFile(null) }}
                  className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all">取消</button>
                <button onClick={handleImportProject}
                  disabled={importing || (importMode === 'zip' && !importFile) || (importMode === 'json' && !importData)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {importing ? '导入中...' : '确认导入'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Projects
