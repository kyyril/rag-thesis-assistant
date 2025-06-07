import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { uploadGuidelines, uploadThesis } from '../services/api'

const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadType, setUploadType] = useState<'guidelines' | 'thesis'>('guidelines')
  const queryClient = useQueryClient()

  const guidelinesMutation = useMutation(uploadGuidelines, {
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries('documents')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal mengupload pedoman skripsi')
    }
  })

  const thesisMutation = useMutation(uploadThesis, {
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries('documents')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal mengupload skripsi')
    }
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Hanya file PDF yang diperbolehkan')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 50MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    if (uploadType === 'guidelines') {
      guidelinesMutation.mutate(formData)
    } else {
      thesisMutation.mutate(formData)
    }
  }

  const isLoading = guidelinesMutation.isLoading || thesisMutation.isLoading

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-secondary-900">Upload Dokumen</h1>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          Upload Pedoman Skripsi atau dokumen skripsi Anda untuk mendapatkan bantuan AI yang lebih akurat.
        </p>
      </motion.div>

      {/* Upload Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Pilih Jenis Dokumen</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setUploadType('guidelines')}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              uploadType === 'guidelines'
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className={`w-6 h-6 ${uploadType === 'guidelines' ? 'text-primary-600' : 'text-secondary-500'}`} />
              <h3 className="font-semibold text-secondary-900">Pedoman Skripsi</h3>
            </div>
            <p className="text-sm text-secondary-600">
              Upload file PDF Pedoman Skripsi UIN Imam Bonjol Padang untuk referensi utama AI.
            </p>
          </button>

          <button
            onClick={() => setUploadType('thesis')}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              uploadType === 'thesis'
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <GraduationCap className={`w-6 h-6 ${uploadType === 'thesis' ? 'text-primary-600' : 'text-secondary-500'}`} />
              <h3 className="font-semibold text-secondary-900">Skripsi Mahasiswa</h3>
            </div>
            <p className="text-sm text-secondary-600">
              Upload draft skripsi Anda untuk mendapatkan feedback dan saran perbaikan.
            </p>
          </button>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-300 hover:border-secondary-400'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Memproses dokumen...
                </h3>
                <p className="text-secondary-600">
                  Mohon tunggu, AI sedang menganalisis dan memproses dokumen Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-secondary-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {uploadType === 'guidelines' ? 'Upload Pedoman Skripsi' : 'Upload Skripsi Anda'}
                </h3>
                <p className="text-secondary-600 mb-4">
                  Drag & drop file PDF di sini, atau klik untuk memilih file
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary cursor-pointer inline-flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Pilih File PDF</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* File Requirements */}
        <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
          <h4 className="font-medium text-secondary-900 mb-2">Persyaratan File:</h4>
          <ul className="text-sm text-secondary-600 space-y-1">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Format: PDF only</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Ukuran maksimal: 50MB</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Dokumen harus berisi teks (bukan scan gambar)</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {(guidelinesMutation.isSuccess || thesisMutation.isSuccess) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-green-50 border-green-200"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Upload Berhasil!</h3>
              <p className="text-green-700">
                Dokumen telah berhasil diproses dan siap digunakan untuk chat dengan AI.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-blue-50 border-blue-200"
        >
          <div className="flex items-start space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Pedoman Skripsi</h3>
              <p className="text-sm text-blue-800">
                Upload Pedoman Skripsi sebagai referensi utama. AI akan menggunakan dokumen ini 
                untuk memberikan jawaban yang sesuai dengan aturan kampus.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-purple-50 border-purple-200"
        >
          <div className="flex items-start space-x-3">
            <GraduationCap className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Skripsi Mahasiswa</h3>
              <p className="text-sm text-purple-800">
                Upload draft skripsi untuk mendapatkan feedback spesifik dan saran perbaikan 
                berdasarkan Pedoman Skripsi yang berlaku.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UploadPage