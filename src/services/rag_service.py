from typing import List, Dict, Any, Optional, Tuple
from loguru import logger
import time
from .vector_store import VectorStore
from .gemini_service import GeminiService
from ..models.schemas import SourceReference


class RAGService:
    def __init__(self, vector_store: VectorStore, gemini_service: GeminiService):
        self.vector_store = vector_store
        self.gemini_service = gemini_service
    
    def process_question(
        self,
        question: str,
        document_id: Optional[str] = None,
        include_guidelines: bool = True,
        top_k: int = 5
    ) -> Tuple[str, List[SourceReference], float]:
        """Process question using RAG pipeline."""
        start_time = time.time()
        
        try:
            # Determine which namespaces to search
            search_namespaces = []
            
            if include_guidelines:
                search_namespaces.append('pedoman')
            
            if document_id:
                search_namespaces.append(f'skripsi_mahasiswa_{document_id}')
            
            if not search_namespaces:
                # If no specific namespaces, search all
                search_namespaces = ['pedoman']
            
            # Retrieve relevant documents
            all_retrieved_chunks = []
            
            for namespace in search_namespaces:
                chunks = self.vector_store.search_similar_documents(
                    query=question,
                    namespace_filter=namespace,
                    top_k=top_k // len(search_namespaces) + 1
                )
                all_retrieved_chunks.extend(chunks)
            
            # Sort by similarity score and take top results
            all_retrieved_chunks.sort(key=lambda x: x['similarity_score'], reverse=True)
            top_chunks = all_retrieved_chunks[:top_k]
            
            logger.info(f"Retrieved {len(top_chunks)} relevant chunks for question")
            
            # Generate response using Gemini
            if top_chunks:
                answer = self.gemini_service.generate_response(
                    question=question,
                    context_chunks=top_chunks
                )
            else:
                # No relevant context found, use simple response
                answer = self.gemini_service.generate_simple_response(question)
                answer += "\n\n*Catatan: Tidak ditemukan konteks yang relevan dari dokumen yang tersedia."
            
            # Extract source references
            sources = self._extract_source_references(top_chunks)
            
            processing_time = time.time() - start_time
            
            return answer, sources, processing_time
            
        except Exception as e:
            logger.error(f"Error in RAG processing: {e}")
            processing_time = time.time() - start_time
            error_answer = f"Maaf, terjadi kesalahan saat memproses pertanyaan Anda: {str(e)}"
            return error_answer, [], processing_time
    
    def _extract_source_references(self, chunks: List[Dict[str, Any]]) -> List[SourceReference]:
        """Extract source references from retrieved chunks."""
        sources = []
        
        for chunk in chunks:
            metadata = chunk.get('metadata', {})
            
            source_name = self._get_source_name(metadata)
            page_number = self._extract_page_number(metadata)
            chapter = metadata.get('chapter', 'Unknown Chapter')
            similarity_score = chunk.get('similarity_score', 0.0)
            
            sources.append(SourceReference(
                source=source_name,
                page=page_number,
                chapter=chapter,
                similarity_score=similarity_score
            ))
        
        # Remove duplicates while preserving order
        unique_sources = []
        seen_sources = set()
        
        for source in sources:
            source_key = (source.source, source.page, source.chapter)
            if source_key not in seen_sources:
                unique_sources.append(source)
                seen_sources.add(source_key)
        
        return unique_sources[:5]  # Limit to top 5 sources
    
    def _get_source_name(self, metadata: Dict[str, Any]) -> str:
        """Get readable source name from metadata."""
        document_type = metadata.get('document_type', 'Unknown Document')
        
        if document_type == 'thesis_guidelines':
            return 'Pedoman Skripsi UIN Imam Bonjol Padang'
        elif document_type == 'student_thesis':
            filename = metadata.get('filename', 'Skripsi Mahasiswa')
            return f"Skripsi: {filename}"
        else:
            return metadata.get('source', 'Unknown Source')
    
    def _extract_page_number(self, metadata: Dict[str, Any]) -> Optional[int]:
        """Extract page number from metadata."""
        # Try different possible page indicators
        page_indicators = ['page', 'page_number', 'halaman']
        
        for indicator in page_indicators:
            if indicator in metadata:
                try:
                    return int(metadata[indicator])
                except (ValueError, TypeError):
                    continue
        
        return None
    
    def get_available_namespaces(self) -> List[str]:
        """Get list of available namespaces in the vector store."""
        try:
            stats = self.vector_store.get_collection_stats()
            namespace_distribution = stats.get('namespace_distribution', {})
            return list(namespace_distribution.keys())
        except Exception as e:
            logger.error(f"Error getting available namespaces: {e}")
            return []
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        try:
            vector_stats = self.vector_store.get_collection_stats()
            gemini_status = self.gemini_service.test_connection()
            
            return {
                'vector_store': vector_stats,
                'gemini_connection': gemini_status,
                'available_namespaces': self.get_available_namespaces(),
                'status': 'healthy' if gemini_status else 'degraded'
            }
            
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }