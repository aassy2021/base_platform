import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Settings,
  Menu,
  X,
  Zap,
  Activity
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Workers from './components/Workers'
import Office from './components/Office'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const navigation = [
    { id: 'dashboard', name: '仪表板', icon: LayoutDashboard },
    { id: 'projects', name: '项目管理', icon: FolderOpen },
    { id: 'workers', name: '数字员工', icon: Users },
    { id: 'office', name: '办公区', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* 侧边栏 */}
      <motion.aside 
        initial={{ width: sidebarOpen ? 250 : 70 }}
        animate={{ width: sidebarOpen ? 250 : 70 }}
        className="relative bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">DeepSee</span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
                  {item.name}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <div className={`flex items-center gap-2 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <Activity className="w-4 h-4 text-green-400 pulse-animation" />
            {sidebarOpen && <span className="text-sm text-dark-300">系统运行中</span>}
          </div>
        </div>
      </motion.aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Dashboard />
              </motion.div>
            )}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Projects />
              </motion.div>
            )}
            {activeTab === 'workers' && (
              <motion.div key="workers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Workers onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'office' && (
              <motion.div key="office" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <Office />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default App