import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  MessageCircle, 
  Upload, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Clock
} from 'lucide-react'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Pedoman Skripsi Terintegrasi',
      description: 'AI memahami seluruh Pedoman Skripsi UIN Imam Bonjol Padang untuk memberikan jawaban yang akurat.'
    },
    {
      icon: MessageCircle,
      title: 'Chat Interaktif',
      description: 'Tanya jawab langsung dengan AI tentang format penulisan, metodologi, dan aturan skripsi.'
    },
    {
      icon: Upload,
      title: 'Upload Skripsi',
      description: 'Upload draft skripsi Anda untuk mendapatkan feedback dan saran perbaikan.'
    },
    {
      icon: FileText,
      title: 'Referensi Akurat',
      description: 'Setiap jawaban dilengkapi dengan referensi halaman dan bab dari Pedoman Skripsi.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Upload Pedoman Skripsi',
      description: 'Admin mengupload file PDF Pedoman Skripsi ke sistem'
    },
    {
      number: '02',
      title: 'Upload Skripsi Anda',
      description: 'Mahasiswa dapat mengupload draft skripsi untuk analisis'
    },
    {
      number: '03',
      title: 'Ajukan Pertanyaan',
      description: 'Tanyakan apapun tentang format, metodologi, atau aturan penulisan'
    },
    {
      number: '04',
      title: 'Dapatkan Jawaban',
      description: 'Terima jawaban lengkap dengan referensi dari Pedoman Skripsi'
    }
  ]

  const stats = [
    { label: 'Mahasiswa Terbantu', value: '500+', icon: Users },
    { label: 'Pertanyaan Dijawab', value: '2,000+', icon: MessageCircle },
    { label: 'Waktu Respon', value: '<3 detik', icon: Clock },
    { label: 'Akurasi Jawaban', value: '95%', icon: CheckCircle }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-600 font-medium">
            <Sparkles className="w-5 h-5" />
            <span>AI-Powered Research Assistant</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 leading-tight">
            Asisten AI untuk
            <span className="text-primary-600 block">Skripsi Anda</span>
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Dapatkan bantuan cerdas untuk memahami Pedoman Skripsi UIN Imam Bonjol Padang. 
            Tanya jawab interaktif dengan AI yang memahami seluruh aturan dan format penulisan skripsi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chat"
            className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Mulai Chat</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/upload"
            className="btn-secondary flex items-center space-x-2 px-8 py-3 text-lg"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Dokumen</span>
          </Link>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-secondary-900 mb-1">{stat.value}</div>
            <div className="text-sm text-secondary-600">{stat.label}</div>
          </div>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Teknologi RAG (Retrieval Augmented Generation) yang memungkinkan AI memberikan jawaban akurat berdasarkan Pedoman Skripsi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              <feature.icon className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
            Cara Kerja
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Proses sederhana untuk mendapatkan bantuan AI dalam penulisan skripsi Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-600">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {step.title}
              </h3>
              <p className="text-secondary-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center space-y-6"
      >
        <h2 className="text-3xl font-bold">
          Siap Memulai Perjalanan Skripsi Anda?
        </h2>
        <p className="text-primary-100 text-lg max-w-2xl mx-auto">
          Bergabunglah dengan ratusan mahasiswa yang telah terbantu dalam menyelesaikan skripsi mereka dengan bantuan AI Assistant.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chat"
            className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Mulai Sekarang</span>
          </Link>
          <Link
            to="/documents"
            className="border border-primary-300 text-white hover:bg-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Lihat Dokumen</span>
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default HomePage