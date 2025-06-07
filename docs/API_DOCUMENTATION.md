# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Tidak ada authentication yang diperlukan untuk versi development ini.

## Endpoints

### 1. Health Check
**GET** `/health`

Mengecek status kesehatan aplikasi.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "version": "1.0.0",
  "services": {
    "vector_store": true,
    "gemini_api": true,
    "pdf_processor": true
  }
}
```

### 2. Upload Guidelines
**POST** `/upload/guidelines`

Upload file PDF Pedoman Skripsi.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "success": true,
  "message": "Pedoman Skripsi berhasil diupload dan diproses",
  "document_id": "guidelines",
  "chunks_created": 45
}
```

**Errors:**
- `400`: File bukan PDF atau ukuran terlalu besar
- `500`: Error processing file

### 3. Upload Student Thesis
**POST** `/upload/thesis`

Upload file PDF skripsi mahasiswa.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "success": true,
  "message": "Skripsi 'filename.pdf' berhasil diupload dan diproses",
  "document_id": "uuid-string",
  "chunks_created": 78
}
```

### 4. Chat
**POST** `/chat`

Bertanya kepada AI assistant.

**Request:**
```json
{
  "question": "Bagaimana format penulisan daftar pustaka?",
  "document_id": "uuid-string",  // optional
  "include_guidelines": true     // optional, default: true
}
```

**Response:**
```json
{
  "answer": "Berdasarkan Pedoman Skripsi...",
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

### 5. List Documents
**GET** `/documents`

Mendapatkan daftar semua dokumen yang telah diupload.

**Response:**
```json
{
  "documents": [
    {
      "id": "guidelines",
      "type": "guidelines",
      "name": "Pedoman Skripsi UIN Imam Bonjol Padang",
      "chunks_count": 45,
      "namespace": "pedoman"
    },
    {
      "id": "uuid-string",
      "type": "student_thesis",
      "name": "Skripsi Mahasiswa (uuid...)",
      "chunks_count": 78,
      "namespace": "skripsi_mahasiswa_uuid"
    }
  ],
  "total_documents": 2,
  "total_chunks": 123
}
```

### 6. Delete Document
**DELETE** `/documents/{document_id}`

Menghapus dokumen dan semua chunk-nya.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted (78 chunks removed)",
  "deleted_chunks": 78
}
```

### 7. System Stats
**GET** `/stats`

Mendapatkan statistik sistem lengkap.

**Response:**
```json
{
  "vector_store": {
    "total_documents": 123,
    "namespace_distribution": {
      "pedoman": 45,
      "skripsi_mahasiswa_uuid1": 78
    },
    "collection_name": "documents"
  },
  "gemini_connection": true,
  "available_namespaces": ["pedoman", "skripsi_mahasiswa_uuid1"],
  "status": "healthy"
}
```

## Error Responses

Semua error response mengikuti format berikut:

```json
{
  "detail": "Error message",
  "error": "Additional error info"
}
```

### Common Error Codes:
- `400`: Bad Request (file format salah, ukuran terlalu besar)
- `404`: Not Found (dokumen tidak ditemukan)
- `500`: Internal Server Error (error processing, API connection)

## Rate Limiting

Tidak ada rate limiting untuk versi development. Untuk production, pertimbangkan untuk menambahkan rate limiting.

## File Upload Limits

- Format: PDF only
- Maximum size: 50MB (configurable via `MAX_FILE_SIZE_MB`)
- Supported: Text-based PDF (tidak support scanned PDF tanpa OCR)

## Best Practices

1. **Upload Guidelines First**: Upload Pedoman Skripsi sebelum menggunakan chat
2. **Specific Questions**: Ajukan pertanyaan yang spesifik untuk hasil yang lebih baik
3. **Check Sources**: Selalu periksa source references dalam response
4. **Error Handling**: Implementasikan proper error handling di client side