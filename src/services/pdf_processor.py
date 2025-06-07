import fitz  # PyMuPDF
import re
from typing import List, Dict, Any, Tuple
from pdfminer.high_level import extract_text
from loguru import logger


class PDFProcessor:
    def __init__(self, max_chunk_size: int = 500, chunk_overlap: int = 50):
        self.max_chunk_size = max_chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF using PyMuPDF for better formatting."""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.get_text()
            
            doc.close()
            return text
        
        except Exception as e:
            logger.error(f"Error extracting text with PyMuPDF: {e}")
            # Fallback to pdfminer
            return extract_text(pdf_path)
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', ' ', text)
        
        # Remove page headers/footers (common patterns)
        text = re.sub(r'--- Page \d+ ---', '', text)
        
        return text.strip()
    
    def extract_chapters_and_sections(self, text: str) -> List[Dict[str, Any]]:
        """Extract chapters and sections from text."""
        sections = []
        
        # Pattern for detecting chapters/sections (customize based on your document format)
        chapter_pattern = r'(BAB|CHAPTER|BAGIAN)\s+([IVX\d]+)\.?\s*([^\n]+)'
        section_pattern = r'(\d+\.\d+\.?\s*[^\n]+)'
        
        current_chapter = "Introduction"
        
        # Split text into paragraphs
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # Check for chapter
            chapter_match = re.search(chapter_pattern, para, re.IGNORECASE)
            if chapter_match:
                current_chapter = f"{chapter_match.group(1)} {chapter_match.group(2)}: {chapter_match.group(3)}"
                continue
            
            # Check for section
            section_match = re.search(section_pattern, para)
            if section_match:
                sections.append({
                    'chapter': current_chapter,
                    'section': section_match.group(1),
                    'content': para
                })
            else:
                # Regular paragraph
                sections.append({
                    'chapter': current_chapter,
                    'section': None,
                    'content': para
                })
        
        return sections
    
    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Split text into chunks with metadata."""
        if metadata is None:
            metadata = {}
        
        # Clean the text first
        text = self.clean_text(text)
        
        # Extract structured content
        sections = self.extract_chapters_and_sections(text)
        
        chunks = []
        chunk_id = 0
        
        for section in sections:
            content = section['content']
            
            # If content is smaller than max_chunk_size, keep as is
            if len(content.split()) <= self.max_chunk_size:
                chunks.append({
                    'id': f"chunk_{chunk_id}",
                    'content': content,
                    'metadata': {
                        **metadata,
                        'chapter': section.get('chapter', 'Unknown'),
                        'section': section.get('section'),
                        'chunk_index': chunk_id,
                        'word_count': len(content.split())
                    }
                })
                chunk_id += 1
            else:
                # Split large content into smaller chunks
                words = content.split()
                for i in range(0, len(words), self.max_chunk_size - self.chunk_overlap):
                    chunk_words = words[i:i + self.max_chunk_size]
                    chunk_content = ' '.join(chunk_words)
                    
                    chunks.append({
                        'id': f"chunk_{chunk_id}",
                        'content': chunk_content,
                        'metadata': {
                            **metadata,
                            'chapter': section.get('chapter', 'Unknown'),
                            'section': section.get('section'),
                            'chunk_index': chunk_id,
                            'word_count': len(chunk_words),
                            'is_continuation': i > 0
                        }
                    })
                    chunk_id += 1
        
        logger.info(f"Created {len(chunks)} chunks from document")
        return chunks
    
    def process_guidelines_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Process thesis guidelines PDF."""
        text = self.extract_text_from_pdf(pdf_path)
        
        metadata = {
            'document_type': 'thesis_guidelines',
            'source': 'UIN Imam Bonjol Padang Thesis Guidelines',
            'namespace': 'pedoman'
        }
        
        return self.chunk_text(text, metadata)
    
    def process_student_thesis_pdf(self, pdf_path: str, student_id: str, filename: str) -> List[Dict[str, Any]]:
        """Process student thesis PDF."""
        text = self.extract_text_from_pdf(pdf_path)
        
        metadata = {
            'document_type': 'student_thesis',
            'student_id': student_id,
            'filename': filename,
            'namespace': f'skripsi_mahasiswa_{student_id}'
        }
        
        return self.chunk_text(text, metadata)