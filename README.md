# RAG-based LLM Assistant dengan Gemini

Sistem AI Assistant yang membantu mahasiswa memahami Pedoman Skripsi dengan menggunakan teknik RAG (Retrieval Augmented Generation) dan Google Gemini API.

## 🌟 Fitur Utama

- **Upload PDF**: Upload Pedoman Skripsi dan skripsi mahasiswa
- **RAG Pipeline**: Retrieval dan generation dengan konteks yang relevan
- **Vector Search**: Pencarian semantik menggunakan ChromaDB
- **Gemini Integration**: Menggunakan Google Gemini Pro untuk generasi jawaban
- **Namespace Separation**: Pemisahan antara dokumen pedoman dan skripsi mahasiswa
- **Source Attribution**: Referensi sumber dan halaman untuk setiap jawaban
- **RESTful API**: API yang lengkap dan mudah digunakan

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI        │    │   ChromaDB      │
│   (Upload UI)   │◄──►│   Backend        │◄──►│   Vector Store  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Gemini API     │
                       │   (LLM Service)  │
                       └──────────────────┘
```

## 📋 Prasyarat

- Python 3.8+
- Google AI Studio API Key (Gemini)
- Minimal 4GB RAM
- 2GB storage space

## 🚀 Instalasi dan Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd rag-llm-assistant
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables

Salin file `.env.example` ke `.env` dan isi dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
APP_NAME="RAG LLM Assistant"
APP_VERSION="1.0.0"
DEBUG=true

# Database Configuration
CHROMA_DB_PATH="./data/chroma_db"

# Document Processing Configuration
MAX_CHUNK_SIZE=500
CHUNK_OVERLAP=50
MAX_FILE_SIZE_MB=50

# RAG Configuration
TOP_K_RETRIEVAL=5
SIMILARITY_THRESHOLD=0.7

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 4. Mendapatkan Gemini API Key

1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik "Create API Key"
4. Salin API Key dan masukkan ke file `.env`

### 5. Jalankan Aplikasi

```bash
python main.py
```

Aplikasi akan berjalan di `http://localhost:8000`

## 📚 Panduan Penggunaan

### 1. Health Check

Cek status aplikasi:

```bash
curl http://localhost:8000/api/v1/health
```

### 2. Upload Pedoman Skripsi

```bash
curl -X POST "http://localhost:8000/api/v1/upload/guidelines" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@pedoman_skripsi.pdf"
```

Response:
```json
{
  "success": true,
  "message": "Pedoman Skripsi berhasil diupload dan diproses",
  "document_id": "guidelines",
  "chunks_created": 45
}
```

### 3. Upload Skripsi Mahasiswa

```bash
curl -X POST "http://localhost:8000/api/v1/upload/thesis" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@skripsi_mahasiswa.pdf"
```

Response:
```json
{
  "success": true,
  "message": "Skripsi 'skripsi_mahasiswa.pdf' berhasil diupload dan diproses",
  "document_id": "uuid-document-id",
  "chunks_created": 78
}
```

### 4. Chat dengan Assistant

```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Bagaimana format penulisan daftar pustaka yang benar?",
    "document_id": "uuid-document-id",
    "include_guidelines": true
  }'
```

Response:
```json
{
  "answer": "Berdasarkan Pedoman Skripsi UIN Imam Bonjol Padang...",
  "sources": [
    {
      "source": "Pedoman Skripsi UIN Imam Bonjol Padang",
      "page": 25,
      "chapter": "BAB IV: Format Penulisan",
      "similarity_score": 0.89
    }
  ],
  "processing_time": 2.45,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 5. List Dokumen

```bash
curl http://localhost:8000/api/v1/documents
```

### 6. Hapus Dokumen

```bash
curl -X DELETE "http://localhost:8000/api/v1/documents/uuid-document-id"
```

## 🔧 Konfigurasi Lanjutan

### Embedding Model

Sistem menggunakan `all-MiniLM-L6-v2` sebagai default. Untuk mengganti:

```python
# Di src/services/vector_store.py
self.embedding_model = SentenceTransformer('your-preferred-model')
```

### Chunk Size

Sesuaikan ukuran chunk untuk dokumen Anda:

```env
MAX_CHUNK_SIZE=500  # Jumlah kata per chunk
CHUNK_OVERLAP=50    # Overlap antar chunk
```

### Parameter RAG

```env
TOP_K_RETRIEVAL=5        # Jumlah chunk yang diambil
SIMILARITY_THRESHOLD=0.7  # Threshold similarity minimum
```

## 🧪 Testing

### Test Health Check

```bash
curl http://localhost:8000/api/v1/health
```

### Test dengan Postman

1. Import collection dari `docs/postman_collection.json`
2. Set environment variable `base_url` ke `http://localhost:8000`
3. Jalankan test scenarios

### Test Manual

1. Upload file PDF Pedoman Skripsi
2. Upload file PDF skripsi mahasiswa
3. Ajukan pertanyaan melalui endpoint chat
4. Periksa response dan source attribution

## 📁 Struktur Project

```
rag-llm-assistant/
├── src/
│   ├── api/
│   │   └── routes.py          # API endpoints
│   ├── config/
│   │   └── settings.py        # Configuration management
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   └── services/
│       ├── pdf_processor.py   # PDF processing service
│       ├── vector_store.py    # Vector database service
│       ├── gemini_service.py  # Gemini API service
│       └── rag_service.py     # RAG pipeline service
├── data/                      # Data storage
├── logs/                      # Application logs
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # Documentation
```

## 🔍 Troubleshooting

### Error: Gemini API Key Invalid

```
Error: Invalid API key
```

**Solusi:**
1. Pastikan API key benar di file `.env`
2. Cek quota API di Google AI Studio
3. Pastikan API key memiliki akses ke Gemini Pro

### Error: ChromaDB Connection

```
Error: Could not connect to ChromaDB
```

**Solusi:**
1. Pastikan folder `data/chroma_db` exists
2. Cek permission folder
3. Restart aplikasi

### Error: PDF Processing Failed

```
Error: Could not extract text from PDF
```

**Solusi:**
1. Pastikan file adalah PDF valid
2. Cek ukuran file (max 50MB)
3. Coba dengan PDF yang tidak ter-password

### Error: Out of Memory

```
Error: Memory allocation failed
```

**Solusi:**
1. Kurangi `MAX_CHUNK_SIZE`
2. Kurangi `TOP_K_RETRIEVAL`
3. Proses file lebih kecil

## 📈 Monitoring

### Logs

Aplikasi menyimpan logs di:
- Console: Real-time logs
- File: `logs/app.log` (rotasi harian)

### Metrics

Akses `/api/v1/stats` untuk melihat:
- Jumlah dokumen
- Status koneksi
- Performa system

## 🚀 Deployment

### Docker (Opsional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

### Production Setup

1. Set `DEBUG=false` di `.env`
2. Gunakan reverse proxy (Nginx)
3. Setup SSL certificate
4. Configure firewall
5. Setup monitoring

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.

## 📞 Support

Untuk pertanyaan atau bantuan:
- Email: support@example.com
- GitHub Issues: [Create Issue](https://github.com/username/repo/issues)

## 🙏 Acknowledgments

- Google Gemini API
- ChromaDB team
- Sentence Transformers
- FastAPI community
- PyMuPDF developers