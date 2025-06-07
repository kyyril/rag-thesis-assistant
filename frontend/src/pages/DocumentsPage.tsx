import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Trash2, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Hash,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { getDocuments, deleteDocument } from '../services/api'

const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error, refetch } = useQuery('documents', getDocuments)

  const deleteMutation = useMutation(deleteDocument, {
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries('documents')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menghapus dokumen')
    }
  })

  const handleDelete = (documentId: string, documentName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${documentName}"?`)) {
      deleteMutation.mutate(documentId)
    }
  }

  const getDocumentIcon = (type: string) => {
    return type === 'guidelines' ? BookOpen : GraduationCap
  }

  const getDocumentColor = (type: string) => {
    return type === 'guidelines' 
      ? 'text-blue-600 bg-blue-100' 
      : 'text-purple-600 bg-purple-100'
  }

  const getDocumentTypeLabel = (type: string) => {
    return type === 'guidelines' ? 'Pedoman Skripsi' : 'Skripsi Mahasiswa'
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Gagal memuat dokumen</h3>
              <p className="text-red-700">Terjadi kesalahan saat mengambil data dokumen.</p>
              <button
                onClick={() => refetch()}
                className="mt-2 btn-secondary text-sm flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-secondary-900">Manajemen Dokumen</h1>
        <p className="text-lg text-secondary-600">
          Kelola dokumen Pedoman Skripsi dan skripsi mahasiswa yang telah diupload.
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card text-center">
          <FileText className="w-8 h-8 text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-secondary-900 mb-1">
            {data?.total_documents || 0}
          </div>
          <div className="text-sm text-secondary-600">Total Dokumen</div>
        </div>

        <div className="card text-center">
          <Hash className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-secondary-900 mb-1">
            {data?.total_chunks || 0}
          </div>
          <div className="text-sm text-secondary-600">Total Chunks</div>
        </div>

        <div className="card text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-secondary-900 mb-1">
            {data?.documents?.filter(doc => doc.type === 'guidelines').length || 0}
          </div>
          <div className="text-sm text-secondary-600">Pedoman Skripsi</div>
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">Daftar Dokumen</h2>
          <button
            onClick={() => refetch()}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {!data?.documents || data.documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Belum ada dokumen
            </h3>
            <p className="text-secondary-600 mb-4">
              Upload Pedoman Skripsi atau skripsi mahasiswa untuk memulai.
            </p>
            <a href="/upload" className="btn-primary">
              Upload Dokumen
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {data.documents.map((document, index) => {
              const Icon = getDocumentIcon(document.type)
              const colorClass = getDocumentColor(document.type)
              
              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {document.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            document.type === 'guidelines'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {getDocumentTypeLabel(document.type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-secondary-600">
                          <div className="flex items-center space-x-1">
                            <Hash className="w-4 h-4" />
                            <span>{document.chunks_count} chunks</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>Namespace: {document.namespace}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(document.id, document.name)}
                      disabled={deleteMutation.isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Hapus dokumen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card bg-yellow-50 border-yellow-200"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-1">Informasi Penting</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Menghapus dokumen akan menghilangkan semua chunks yang terkait</li>
              <li>• Pedoman Skripsi digunakan sebagai referensi utama untuk semua pertanyaan</li>
              <li>• Skripsi mahasiswa digunakan untuk memberikan feedback yang lebih spesifik</li>
              <li>• Proses upload dan indexing dokumen membutuhkan waktu beberapa detik</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DocumentsPage