import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Settings, User, Grid, Loader2, Layout, Users, X, ChevronRight, Check } from 'lucide-react'
import axios from 'axios'

const Office = () => {
  const [office, setOffice] = useState({})
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [newSlots, setNewSlots] = useState(3)
  const [activeTab, setActiveTab] = useState('office')
  const [assigningSlot, setAssigningSlot] = useState(null)

  useEffect(() => { 
    fetchOfficeData()
  }, [])

  // 单独处理 sessionStorage 里的分配请求
  useEffect(() => {
    const assignWorkerId = sessionStorage.getItem('assignWorkerId')
    if (assignWorkerId) {
      sessionStorage.removeItem('assignWorkerId')
      setSelectedWorker(assignWorkerId)
      setActiveTab('layout')
    }
  }, [])

  const fetchOfficeData = async () => {
    try {
      const [officeRes, workersRes] = await Promise.all([
        axios.get('/api/office'), 
        axios.get('/api/workers')
      ])
      setOffice(officeRes.data.office || {})
      setWorkers(workersRes.data.workers || [])
    } catch (error) {
      console.error('获取办公区数据失败:', error)
      setOffice({})
      setWorkers([])
    } finally { setLoading(false) }
  }

  const handleCreateSlots = async () => {
    try {
      const existingCount = Object.keys(office).length
      const slots = Array.from({ length: newSlots }, (_, i) => ({
        id: `desk-${String(existingCount + i + 1).padStart(3, '0')}`
      }))
      await axios.post('/api/office', { slots })
      fetchOfficeData()
      setShowModal(false)
    } catch (error) {
      console.error('创建工位失败:', error)
      alert('创建工位失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleAssignWorker = async (slotId) => {
    if (!selectedWorker) {
      alert('请先选择一个员工')
      return
    }
    setAssigningSlot(slotId)
    try {
      await axios.post('/api/assign', null, {
        params: { worker_id: selectedWorker, slot_id: slotId }
      })
      setSelectedWorker(null)
      setAssigningSlot(null)
      fetchOfficeData()
    } catch (error) {
      console.error('分配员工失败:', error)
      alert('分配失败: ' + (error.response?.data?.detail || error.message))
      setAssigningSlot(null)
    }
  }

  const handleReleaseWorker = async (workerId) => {
    try {
      await axios.post('/api/release', null, { params: { worker_id: workerId } })
      fetchOfficeData()
    } catch (error) {
      console.error('释放员工失败:', error)
      alert('释放失败: ' + (error.response?.data?.detail || error.message))
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>

  const slotEntries = Object.entries(office)
  const activeSlots = slotEntries.filter(([_, s]) => s.state === 'active').length
  const emptySlots = slotEntries.filter(([_, s]) => s.state === 'empty').length
  const availableWorkers = workers.filter(w => !w.slot)
  // 找到选中员工的信息
  const selectedWorkerInfo = workers.find(w => w.id === selectedWorker)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">办公区</h1>
          <p className="text-dark-400 mt-1">管理工位和员工分配</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-dark-400">
            <span className="text-green-400">{activeSlots}</span> 使用中 • <span className="text-amber-400">{emptySlots}</span> 空闲
          </div>
        </div>
      </div>

      {/* 分页导航 */}
      <div className="flex gap-2 p-1 bg-dark-800/50 rounded-xl border border-dark-700/50">
        <button
          onClick={() => setActiveTab('office')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
            activeTab === 'office' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
              : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
          }`}
        >
          <Users className="w-5 h-5" />
          办公区管理
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
            activeTab === 'layout' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
              : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
          }`}
        >
          <Layout className="w-5 h-5" />
          工位布局
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'office' && (
          <motion.div
            key="office"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 员工选择卡片 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> 员工分配
              </h2>
              <div className="flex flex-wrap gap-3">
                {availableWorkers.map(worker => (
                  <button key={worker.id} onClick={() => setSelectedWorker(selectedWorker === worker.id ? null : worker.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedWorker === worker.id ? 'bg-purple-500 text-white shadow-lg scale-105' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>
                    <User className="w-4 h-4" /> {worker.type} ({worker.id.slice(0, 8)})
                  </button>
                ))}
                {availableWorkers.length === 0 && <p className="text-dark-500 text-sm">所有员工都已分配工位</p>}
              </div>
              {selectedWorker && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                >
                  <p className="text-sm text-purple-300 flex items-center gap-2">
                    <Check className="w-4 h-4" /> 
                    已选择: <strong>{selectedWorkerInfo?.type || selectedWorker}</strong>，切换到"工位布局"点击空闲工位分配
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* 已分配员工列表 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gradient-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" /> 已分配员工
              </h2>
              <div className="space-y-3">
                {slotEntries.filter(([_, s]) => s.state === 'active').map(([slotId, slot]) => (
                  <motion.div 
                    key={slotId} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl border border-dark-600 hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{slot.worker_type}</p>
                        <p className="text-sm text-dark-400">{slot.worker_id} • {slotId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
                        <span className="text-xs text-green-400">工作中</span>
                      </div>
                      <button 
                        onClick={() => handleReleaseWorker(slot.worker_id)}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {slotEntries.filter(([_, s]) => s.state === 'active').length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500">暂无已分配的员工</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="gradient-border rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-white mb-2">{slotEntries.length}</div>
                <div className="text-dark-400 text-sm">总工位数</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="gradient-border rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{activeSlots}</div>
                <div className="text-dark-400 text-sm">使用中</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="gradient-border rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">{emptySlots}</div>
                <div className="text-dark-400 text-sm">空闲中</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'layout' && (
          <motion.div
            key="layout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 已选员工提示条 */}
            {selectedWorker && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">已选择: {selectedWorkerInfo?.type || selectedWorker}</p>
                    <p className="text-sm text-purple-300">点击下方空闲工位即可分配</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* 工位网格 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-blue-400" /> 办公区布局
                </h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg">
                  <Plus className="w-5 h-5" /> 添加工位
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slotEntries.map(([slotId, slot], index) => (
                  <motion.div key={slotId} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      slot.state === 'active' 
                        ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-lg shadow-green-500/10' 
                        : selectedWorker
                          ? 'border-dashed border-purple-500/40 bg-dark-800/50 cursor-pointer hover:border-purple-500/70 hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105'
                          : 'border-dark-600 bg-dark-800/50'
                    }`}
                    onClick={() => {
                      if (selectedWorker && slot.state === 'empty') {
                        handleAssignWorker(slotId)
                      }
                    }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-dark-300">{slotId}</span>
                      {slot.state === 'active' && (
                        <button onClick={(e) => { e.stopPropagation(); handleReleaseWorker(slot.worker_id) }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {slot.state === 'active' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{slot.worker_type}</p>
                            <p className="text-xs text-dark-400">{slot.worker_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div> 工作中
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all ${
                          selectedWorker 
                            ? 'bg-purple-500/20 border-2 border-dashed border-purple-500/50 animate-pulse' 
                            : 'bg-dark-700'
                        }`}>
                          {assigningSlot === slotId ? (
                            <Loader2 className={`w-7 h-7 text-purple-400 animate-spin`} />
                          ) : (
                            <Settings className={`w-7 h-7 ${selectedWorker ? 'text-purple-400' : 'text-dark-500'}`} />
                          )}
                        </div>
                        <p className={`text-sm ${selectedWorker ? 'text-purple-300 font-medium' : 'text-dark-500'}`}>空闲工位</p>
                        {selectedWorker && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-purple-400 mt-2 font-medium"
                          >
                            👆 点击分配
                          </motion.p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {slotEntries.length === 0 && (
                <div className="text-center py-12">
                  <Grid className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400 text-lg">暂无工位</p>
                  <p className="text-dark-500 text-sm mt-1">点击"添加工位"开始创建</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加工位弹窗 */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 w-full max-w-md border border-dark-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">添加工位</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setNewSlots(Math.max(1, newSlots - 1))} className="w-12 h-12 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-all text-xl font-bold">-</button>
                  <span className="text-3xl font-bold text-white w-16 text-center">{newSlots}</span>
                  <button onClick={() => setNewSlots(newSlots + 1)} className="w-12 h-12 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-all text-xl font-bold">+</button>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-all">取消</button>
                  <button onClick={handleCreateSlots} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg">添加工位</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Office
