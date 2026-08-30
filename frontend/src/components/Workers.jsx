import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, User, Settings, Users, Loader2, Upload, FileJson, X, Check, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const Workers = ({ onNavigate }) => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newWorker, setNewWorker] = useState({ worker_type: '', capabilities: '' })
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMode, setImportMode] = useState('json')
  const [importData, setImportData] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const workerTypes = [
    { type: '数据分析师', capabilities: ['数据分析', '统计建模', '报告生成'] },
    { type: '代码工程师', capabilities: ['编程开发', '代码调试', '性能优化'] },
    { type: '项目经理', capabilities: ['项目规划', '团队协调', '进度管理'] },
    { type: '测试工程师', capabilities: ['自动化测试', '质量保证', 'Bug追踪'] },
  ]

  useEffect(() => { fetchWorkers() }, [])

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers')
      setWorkers(response.data.workers)
    } catch (error) {
      console.error('获取员工列表失败:', error)
      setWorkers([])
    } finally { setLoading(false) }
  }

  const handleCreateWorker = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/workers', {
        worker_type: newWorker.worker_type,
        capabilities: newWorker.capabilities.split(',').map(c => c.trim()).filter(c => c)
      })
      setShowModal(false)
      setNewWorker({ worker_type: '', capabilities: '' })
      fetchWorkers()
    } catch (error) {
      console.error('创建员工失败:', error)
      alert('创建失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleFireWorker = async (workerId) => {
    try {
      await axios.delete(`/api/workers/${workerId}`)
      setConfirmDeleteId(null)
      fetchWorkers()
    } catch (error) {
      console.error('解雇员工失败:', error)
      alert('删除失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleImportWorker = async () => {
    setImporting(true)
    try {
      let workerData
      if (importMode === 'json') {
        try {
          workerData = JSON.parse(importData)
        } catch (e) {
          alert('JSON格式错误，请检查输入')
          setImporting(false)
          return
        }
      } else {
        if (!importFile) {
          alert('请先选择文件')
          setImporting(false)
          return
        }
        const text = await importFile.text()
        try {
          workerData = JSON.parse(text)
        } catch (e) {
          alert('文件格式错误，请确保是有效的JSON文件')
          setImporting(false)
          return
        }
      }
      const workersToImport = Array.isArray(workerData) ? workerData : [workerData]
      for (const worker of workersToImport) {
        await axios.post('/api/workers', {
          worker_type: worker.worker_type || worker.type || '未命名员工',
          capabilities: worker.capabilities || []
        })
      }
      alert(`成功导入 ${workersToImport.length} 个员工`)
      setShowImportModal(false)
      setImportData('')
      setImportFile(null)
      fetchWorkers()
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

  const selectWorkerType = (type) => {
    const wt = workerTypes.find(w => w.type === type)
    if (wt) setNewWorker({ worker_type: type, capabilities: wt.capabilities.join(', ') })
  }

  const handleNavigateToOffice = (workerId) => {
    sessionStorage.setItem('assignWorkerId', workerId)
    if (onNavigate) onNavigate('office')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 text-purple-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">数字员工</h1>
          <p className="text-dark-400 mt-1">管理底座中的数字员工</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg">
            <Upload className="w-5 h-5" /> 导入员工
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> 雇佣新员工
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {workers.map((worker) => (
            <motion.div key={worker.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} layout
              className="gradient-border rounded-xl p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{worker.type}</h3>
                    <p className="text-sm text-dark-400">{worker.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${worker.state === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {worker.state === 'active' ? '工作中' : '空闲'}
                </span>
              </div>
              {worker.slot ? (
                <div className="flex items-center gap-2 mb-4 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Settings className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">工位: {worker.slot}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 p-2 bg-dark-700/50 rounded-lg">
                  <span className="text-sm text-dark-500">未分配工位</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {worker.capabilities.map((cap, i) => <span key={i} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">{cap}</span>)}
              </div>

              {/* 删除确认 */}
              {confirmDeleteId === worker.id ? (
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                    <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-xs text-red-300 mb-2">确定解雇？</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFireWorker(worker.id)}
                        className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                      >
                        确认
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 px-3 py-1.5 bg-dark-600 text-dark-300 text-xs rounded-lg hover:bg-dark-500 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {!worker.slot ? (
                    <button 
                      onClick={() => handleNavigateToOffice(worker.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                    >
                      <Settings className="w-4 h-4" /> 分配工位
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg border border-green-500/30">
                      <Settings className="w-4 h-4" /> 已分配
                    </div>
                  )}
                  <button 
                    onClick={() => setConfirmDeleteId(worker.id)} 
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {workers.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">暂无数字员工</p>
            <p className="text-dark-500 text-sm mt-1">点击"雇佣新员工"开始创建</p>
          </div>
        )}
      </div>

      {/* 创建员工弹窗 */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 w-full max-w-md border border-dark-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">雇佣新员工</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-300 mb-2">快速选择类型:</label>
                <div className="flex flex-wrap gap-2">
                  {workerTypes.map((type) => (
                    <button key={type.type} onClick={() => selectWorkerType(type.type)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${newWorker.worker_type === type.type ? 'bg-purple-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>
                      {type.type}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleCreateWorker} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">员工类型 *</label>
                  <input type="text" value={newWorker.worker_type} onChange={(e) => setNewWorker({...newWorker, worker_type: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">专业技能 (逗号分隔) *</label>
                  <input type="text" value={newWorker.capabilities} onChange={(e) => setNewWorker({...newWorker, capabilities: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all">取消</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg">雇佣员工</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 导入员工弹窗 */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 w-full max-w-lg border border-dark-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">导入员工</h2>
                <button onClick={() => setShowImportModal(false)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setImportMode('json')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    importMode === 'json' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
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
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  本地文件
                </button>
              </div>

              {importMode === 'json' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">粘贴员工JSON数据</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="w-full h-40 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder={'[\n  {\n    "worker_type": "数据分析师",\n    "capabilities": ["数据分析", "统计建模"]\n  }\n]'}
                    />
                  </div>
                  <div className="p-3 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-xs text-dark-400">
                      <strong className="text-dark-300">格式说明：</strong> 支持单个对象或对象数组，包含 worker_type、capabilities 字段
                    </p>
                  </div>
                </div>
              )}

              {importMode === 'file' && (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-dark-600 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer"
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
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { setShowImportModal(false); setImportData(''); setImportFile(null) }} 
                  className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleImportWorker}
                  disabled={importing || (importMode === 'json' && !importData) || (importMode === 'file' && !importFile)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

export default Workers
