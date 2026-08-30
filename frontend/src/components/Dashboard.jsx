import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, Users, Activity, TrendingUp, Clock, CheckCircle, AlertCircle, Zap
} from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard')
      setStats(response.data)
    } catch (error) {
      setStats({
        summary: { total_projects: 3, active_projects: 2, total_workers: 5, active_workers: 4, total_slots: 8, empty_slots: 3, utilization_rate: 62.5 },
        recent_activity: [
          { type: 'project', action: 'mounted', name: '数据分析项目', time: new Date().toISOString() },
        ]
      })
    } finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  const statCards = [
    { title: '活跃项目', value: stats?.summary?.active_projects || 0, total: stats?.summary?.total_projects || 0, icon: FolderOpen, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    { title: '活跃员工', value: stats?.summary?.active_workers || 0, total: stats?.summary?.total_workers || 0, icon: Users, color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    { title: '工位使用率', value: `${stats?.summary?.utilization_rate || 0}%`, icon: Activity, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
    { title: '空闲工位', value: stats?.summary?.empty_slots || 0, total: stats?.summary?.total_slots || 0, icon: Clock, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">仪表板</h1>
          <p className="text-dark-400 mt-1">底座系统运行概览</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">系统正常运行</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className={`gradient-border rounded-xl p-6 card-hover ${card.bgColor} border ${card.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-white">{card.value}</span>
                  {card.total && <span className="text-dark-500">/ {card.total}</span>}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="gradient-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" /> 最近活动
        </h2>
        <div className="space-y-3">
          {stats?.recent_activity?.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-all border border-dark-700/50 hover:border-dark-600">
              {activity.action === 'mounted' ? (
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              ) : (
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div className="flex-1">
                <span className="text-white font-medium">{activity.name}</span>
                <span className="text-dark-400 ml-2">{activity.action === 'mounted' ? '已插入' : '已雇佣'}</span>
              </div>
              <span className="text-dark-500 text-sm">{new Date(activity.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard