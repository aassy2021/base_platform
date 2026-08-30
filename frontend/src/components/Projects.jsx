import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, Pause, FolderOpen, Loader2, Upload, FileJson, Download, X, Check } from 'lucide-react'
import axios from 'axios'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', dependencies: '' })
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMode, setImportMode] = useState('json') // json 或 file
  const [importData, setImportData] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data.projects)
    } catch (error) {
      setProjects([
        { id: 'proj-001', name: '数据分析项目', state: 'running', dependencies: ['pandas', 'numpy'], description: '处理销售数据' },
        { id: 'proj-002', name: 'Web应用开发', state: 'mounted', dependencies: ['flask', 'sqlalchemy'], description: '企业内部管理系统' }
      ])
    } finally { setLoading(false) }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      console.log('创建项目:', newProject)
      const response = await axios.post('/api/projects', {
        name: newProject.name,
        description: newProject.description,
        dependencies: newProject.dependencies.split(',').map(d => d.trim()).filter(d => d)
      })
      console.log('创建结果:', response.data)
      setShowModal(false)
      setNewProject({ name: '', description: '', dependencies: '' })
      fetchProjects()
    } catch (error) {
      console.error('创建项目失败:', error)
      alert('创建失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('确定要从底座拔出此项目吗？')) {
      try { await axios.delete(`/api/projects/${projectId}`); fetchProjects() } catch (error) { console.error('删除项目失败:', error) }
    }
  }

  const handleImportProject = async () => {
    setImporting(true)
    try {
      let projectData
      
      if (importMode === 'json') {
        // JSON文本导入
        try {
          projectData = JSON.parse(importData)
        } catch (e) {
          alert('JSON格式错误，请检查输入')
          setImporting(false)
          return
        }
      } else {
        // 文件导入
        if (!importFile) {
          alert('请先选择文件')
          setImporting(false)
          return
        }
        const text = await importFile.text()
        try {
          projectData = JSON.parse(text)
        } catch (e) {
          alert('文件格式错误，请确保是有效的JSON文件')
          setImporting(false)
          return
        }
      }

      // 确保是数组格式
      const projectsToImport = Array.isArray(projectData) ? projectData : [projectData]
      
      // 逐个导入项目
      for (const proj of projectsToImport) {
        await axios.post('/api/projects', {
          name: proj.name || '导入的项目',
          description: proj.description || '',
          dependencies: proj.dependencies || []
        })
      }
      
      alert(`成功导入 ${projectsToImport.length} 个项目`)
      setShowImportModal(false)
      setImportData('')
      setImportFile(null)
      fetchProjects()
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败: ' + (error.response?.data?.detail || error.message))
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
      setImportMode('file')
    }
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'mounted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">项目管理</h1>
          <p className="text-dark-400 mt-1">管理插入底座的项目</p>
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
                    <p className="text-sm text-dark-400">{project.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStateColor(project.state)}`}>
                  {project.state === 'running' ? '运行中' : project.state === 'mounted' ? '已安装' : project.state}
                </span>
              </div>
              <p className="text-dark-300 text-sm mb-4">{project.description || '暂无描述'}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.dependencies.map((dep, i) => <span key={i} className="px-2 py-1 text-xs bg-dark-700 text-dark-300 rounded-md">{dep}</span>)}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30">
                  <Play className="w-4 h-4" /> 启动
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors border border-amber-500/30">
                  <Pause className="w-4 h-4" /> 暂停
                </button>
                <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="flask, sqlalchemy" />
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
                <button onClick={() => setShowImportModal(false)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 导入模式选择 */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setImportMode('json')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    importMode === 'json' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <FileJson className="w-5 h-5" />
                  JSON文本
                </button>
                <button
                  onClick={() => setImportMode('file')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    importMode === 'file' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  本地文件
                </button>
              </div>

              {/* JSON文本导入 */}
              {importMode === 'json' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">粘贴项目JSON数据</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="w-full h-40 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder={`[
  {
    "name": "项目名称",
    "description": "项目描述",
    "dependencies": ["dep1", "dep2"]
  }
]`}
                    />
                  </div>
                  <div className="p-3 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-xs text-dark-400">
                      <strong className="text-dark-300">格式说明：</strong> 支持单个对象或对象数组，包含 name、description、dependencies 字段
                    </p>
                  </div>
                </div>
              )}

              {/* 文件导入 */}
              {importMode === 'file' && (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-dark-600 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-dark-500 mb-3" />
                    {importFile ? (
                      <div className="text-center">
                        <p className="text-white font-medium">{importFile.name}</p>
                        <p className="text-sm text-dark-400">{(importFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-dark-400">点击选择JSON文件</p>
                        <p className="text-xs text-dark-500 mt-1">支持 .json 格式</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { setShowImportModal(false); setImportData(''); setImportFile(null) }} 
                  className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleImportProject}
                  disabled={importing || (importMode === 'json' && !importData) || (importMode === 'file' && !importFile)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
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