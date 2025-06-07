import google.generativeai as genai
from typing import List, Dict, Any, Optional
from loguru import logger
import time


class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Gemini API."""
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemini service: {e}")
            raise
    
    def generate_response(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate response using Gemini with RAG context."""
        try:
            # Build context from retrieved chunks
            context_parts = []
            
            # Separate guidelines and thesis contexts
            guidelines_context = []
            thesis_context = []
            
            for chunk in context_chunks:
                metadata = chunk.get('metadata', {})
                content = chunk.get('content', '')
                namespace = metadata.get('namespace', '')
                
                if 'pedoman' in namespace:
                    chapter = metadata.get('chapter', 'Unknown Chapter')
                    guidelines_context.append(f"[Pedoman - {chapter}]: {content}")
                elif 'skripsi_mahasiswa' in namespace:
                    chapter = metadata.get('chapter', 'Unknown Chapter')
                    thesis_context.append(f"[Skripsi - {chapter}]: {content}")
            
            # Build comprehensive prompt
            prompt_parts = [
                "Anda adalah asisten AI yang membantu mahasiswa memahami Pedoman Skripsi UIN Imam Bonjol Padang.",
                "Berikan jawaban yang akurat berdasarkan konteks yang diberikan.",
                "Prioritaskan informasi dari Pedoman Skripsi sebagai referensi utama.",
                "Jika ada informasi dari skripsi mahasiswa, gunakan sebagai contoh atau referensi tambahan.",
                "Berikan jawaban dalam bahasa Indonesia yang jelas dan mudah dipahami.",
                "",
                "[KONTEKS PEDOMAN SKRIPSI]:"
            ]
            
            if guidelines_context:
                prompt_parts.extend(guidelines_context)
            else:
                prompt_parts.append("Tidak ada konteks Pedoman Skripsi yang relevan ditemukan.")
            
            prompt_parts.append("\n[KONTEKS SKRIPSI MAHASISWA]:")
            
            if thesis_context:
                prompt_parts.extend(thesis_context)
            else:
                prompt_parts.append("Tidak ada konteks skripsi mahasiswa yang relevan.")
            
            prompt_parts.extend([
                "",
                f"[PERTANYAAN MAHASISWA]: {question}",
                "",
                "[JAWABAN]:",
                "Berdasarkan Pedoman Skripsi UIN Imam Bonjol Padang dan konteks yang tersedia, berikut adalah penjelasan untuk pertanyaan Anda:"
            ])
            
            full_prompt = "\n".join(prompt_parts)
            
            # Generate response with Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                )
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return f"Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Error: {str(e)}"
    
    def generate_simple_response(self, question: str) -> str:
        """Generate a simple response without RAG context."""
        try:
            prompt = f"""
            Anda adalah asisten AI yang membantu mahasiswa dengan pertanyaan umum tentang skripsi.
            
            Pertanyaan: {question}
            
            Berikan jawaban yang informatif dan membantu dalam bahasa Indonesia.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating simple response: {e}")
            return "Maaf, terjadi kesalahan saat memproses pertanyaan Anda."
    
    def test_connection(self) -> bool:
        """Test Gemini API connection."""
        try:
            response = self.model.generate_content("Test connection")
            return len(response.text) > 0
        except Exception as e:
            logger.error(f"Gemini connection test failed: {e}")
            return False