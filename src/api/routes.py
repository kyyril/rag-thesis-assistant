from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
import os
import tempfile
import shutil

from ..models.schemas import (
    ChatRequest, ChatResponse, UploadResponse, 
    DocumentInfo, HealthCheck, SourceReference
)
from ..services.pdf_processor import PDFProcessor
from ..services.vector_store import VectorStore
from ..services.gemini_service import GeminiService
from ..services.rag_service import RAGService
from ..config.settings import settings
from loguru import logger

router = APIRouter()

# Initialize services
pdf_processor = PDFProcessor(
    max_chunk_size=settings.max_chunk_size,
    chunk_overlap=settings.chunk_overlap
)

vector_store = VectorStore(persist_directory=settings.chroma_db_path)
gemini_service = GeminiService(api_key=settings.gemini_api_key)
rag_service = RAGService(vector_store=vector_store, gemini_service=gemini_service)


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    try:
        stats = rag_service.get_system_stats()
        
        return HealthCheck(
            status="healthy" if stats.get('status') == 'healthy' else "degraded",
            timestamp=datetime.now(),
            version=settings.app_version,
            services={
                "vector_store": stats.get('vector_store', {}).get('total_documents', 0) >= 0,
                "gemini_api": stats.get('gemini_connection', False),
                "pdf_processor": True
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.post("/upload/guidelines", response_model=UploadResponse)
async def upload_guidelines(file: UploadFile = File(...)):
    """Upload thesis guidelines PDF."""
    try:
        # Validate file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Check file size
        file_size = 0
        temp_content = await file.read()
        file_size = len(temp_content)
        
        if file_size > settings.max_file_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds {settings.max_file_size_mb}MB limit"
            )
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(temp_content)
            temp_file_path = temp_file.name
        
        try:
            # Process PDF
            chunks = pdf_processor.process_guidelines_pdf(temp_file_path)
            
            # Store in vector database
            vector_store.add_documents(chunks, collection_name="documents")
            
            logger.info(f"Successfully processed guidelines: {len(chunks)} chunks created")
            
            return UploadResponse(
                success=True,
                message="Pedoman Skripsi berhasil diupload dan diproses",
                document_id="guidelines",
                chunks_created=len(chunks)
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading guidelines: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload/thesis", response_model=UploadResponse)
async def upload_student_thesis(file: UploadFile = File(...)):
    """Upload student thesis PDF."""
    try:
        # Validate file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Check file size
        temp_content = await file.read()
        file_size = len(temp_content)
        
        if file_size > settings.max_file_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds {settings.max_file_size_mb}MB limit"
            )
        
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(temp_content)
            temp_file_path = temp_file.name
        
        try:
            # Process PDF
            chunks = pdf_processor.process_student_thesis_pdf(
                temp_file_path, 
                document_id, 
                file.filename
            )
            
            # Store in vector database
            vector_store.add_documents(chunks, collection_name="documents")
            
            logger.info(f"Successfully processed thesis {file.filename}: {len(chunks)} chunks created")
            
            return UploadResponse(
                success=True,
                message=f"Skripsi '{file.filename}' berhasil diupload dan diproses",
                document_id=document_id,
                chunks_created=len(chunks)
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading thesis: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """Chat with the RAG assistant."""
    try:
        # Process question using RAG
        answer, sources, processing_time = rag_service.process_question(
            question=request.question,
            document_id=request.document_id,
            include_guidelines=request.include_guidelines,
            top_k=settings.top_k_retrieval
        )
        
        return ChatResponse(
            answer=answer,
            sources=sources,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@router.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    try:
        stats = vector_store.get_collection_stats()
        namespace_distribution = stats.get('namespace_distribution', {})
        
        documents = []
        
        for namespace, count in namespace_distribution.items():
            if namespace == 'pedoman':
                documents.append({
                    'id': 'guidelines',
                    'type': 'guidelines',
                    'name': 'Pedoman Skripsi UIN Imam Bonjol Padang',
                    'chunks_count': count,
                    'namespace': namespace
                })
            elif namespace.startswith('skripsi_mahasiswa_'):
                doc_id = namespace.replace('skripsi_mahasiswa_', '')
                documents.append({
                    'id': doc_id,
                    'type': 'student_thesis',
                    'name': f'Skripsi Mahasiswa ({doc_id[:8]}...)',
                    'chunks_count': count,
                    'namespace': namespace
                })
        
        return {
            'documents': documents,
            'total_documents': len(documents),
            'total_chunks': stats.get('total_documents', 0)
        }
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its chunks."""
    try:
        if document_id == 'guidelines':
            namespace = 'pedoman'
            deleted_count = vector_store.delete_documents_by_namespace(namespace)
            message = f"Pedoman Skripsi deleted ({deleted_count} chunks removed)"
        else:
            namespace = f'skripsi_mahasiswa_{document_id}'
            deleted_count = vector_store.delete_documents_by_namespace(namespace)
            message = f"Student thesis deleted ({deleted_count} chunks removed)"
        
        return {
            'success': True,
            'message': message,
            'deleted_chunks': deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@router.get("/stats")
async def get_system_stats():
    """Get comprehensive system statistics."""
    try:
        return rag_service.get_system_stats()
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")