import React from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Server,
  Brain,
  FileText,
  Hash
} from 'lucide-react'
import { useQuery } from 'react-query'
import { getSystemStats, getHealth } from '../services/api'

const StatsPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    'systemStats', 
    getSystemStats,
    { refetchInterval: 30000 } // Refresh every 30 seconds
  )

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery(
    'health', 
    getHealth,
    { refetchInterval: 10000 } // Refresh every 10 seconds
  )

  const getStatusColor = (status: string | boolean) => {
    if (status === 'healthy' || status === true) {
      return 'text-green-600 bg-green-100'
    } else if (status === 'degraded') {
      return 'text-yellow-600 bg-yellow-100'
    } else {
      return 'text-red-600 bg-red-100'
    }
  }

  const getStatusIcon = (status: string | boolean) => {
    if (status === 'healthy' || status === true) {
      return CheckCircle
    } else {
      return AlertTriangle
    }
  }

  const formatUptime = (timestamp: string) => {
    const now = new Date()
    const start = new Date(timestamp)
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-secondary-900">Statistik Sistem</h1>
        <p className="text-lg text-secondary-600">
          Monitor kesehatan dan performa sistem RAG LLM Assistant.
        </p>
      </motion.div>

      {/* System Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">Status Sistem</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => refetchHealth()}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {healthLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary-100 rounded"></div>
              ))}
            </div>
          </div>
        ) : health ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-lg font-medium text-secondary-900">
                Status: {health.status === 'healthy' ? 'Sehat' : 'Bermasalah'}
              </span>
              <span className="text-sm text-secondary-600">
                (Terakhir update: {new Date(health.timestamp).toLocaleTimeString('id-ID')})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(health.services).map(([service, status]) => {
                const StatusIcon = getStatusIcon(status)
                const colorClass = getStatusColor(status)
                
                return (
                  <div key={service} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary-900 capitalize">
                          {service.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {status ? 'Aktif' : 'Tidak Aktif'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            Gagal memuat status sistem
          </div>
        )}
      </motion.div>

      {/* Vector Store Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">Vector Database</h2>
          <button
            onClick={() => refetchStats()}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {statsLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-secondary-100 rounded"></div>
              ))}
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-secondary-200 rounded-lg p-4 text-center">
                <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary-900">
                  {stats.vector_store?.total_documents || 0}
                </div>
                <div className="text-sm text-secondary-600">Total Dokumen</div>
              </div>

              <div className="border border-secondary-200 rounded-lg p-4 text-center">
                <Hash className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary-900">
                  {Object.values(stats.vector_store?.namespace_distribution || {}).reduce((a: number, b: number) => a + b, 0)}
                </div>
                <div className="text-sm text-secondary-600">Total Chunks</div>
              </div>

              <div className="border border-secondary-200 rounded-lg p-4 text-center">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary-900">
                  {stats.gemini_connection ? 'Aktif' : 'Tidak Aktif'}
                </div>
                <div className="text-sm text-secondary-600">Gemini API</div>
              </div>

              <div className="border border-secondary-200 rounded-lg p-4 text-center">
                <Server className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary-900">
                  {stats.available_namespaces?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">Namespaces</div>
              </div>
            </div>

            {/* Namespace Distribution */}
            {stats.vector_store?.namespace_distribution && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Distribusi Namespace
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.vector_store.namespace_distribution).map(([namespace, count]) => (
                    <div key={namespace} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-secondary-500" />
                        <span className="font-medium text-secondary-900">
                          {namespace === 'pedoman' ? 'Pedoman Skripsi' : `Skripsi Mahasiswa (${namespace.replace('skripsi_mahasiswa_', '')})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-secondary-600">{count} chunks</span>
                        <div className="w-16 bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(stats.vector_store.namespace_distribution))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            Gagal memuat statistik sistem
          </div>
        )}
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Aplikasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-600">Versi:</span>
              <span className="font-medium text-secondary-900">{health?.version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Status:</span>
              <span className={`font-medium ${
                stats?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats?.status === 'healthy' ? 'Sehat' : 'Bermasalah'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Collection:</span>
              <span className="font-medium text-secondary-900">
                {stats?.vector_store?.collection_name || 'documents'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performa</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-600">Uptime:</span>
              <span className="font-medium text-secondary-900">
                {health?.timestamp ? formatUptime(health.timestamp) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Last Update:</span>
              <span className="font-medium text-secondary-900">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString('id-ID') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Auto Refresh:</span>
              <span className="font-medium text-green-600">Aktif</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsPage