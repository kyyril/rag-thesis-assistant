import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Gemini API Configuration
    gemini_api_key: str
    
    # Application Configuration
    app_name: str = "RAG LLM Assistant"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database Configuration
    chroma_db_path: str = "./data/chroma_db"
    
    # Document Processing Configuration
    max_chunk_size: int = 500
    chunk_overlap: int = 50
    max_file_size_mb: int = 50
    
    # RAG Configuration
    top_k_retrieval: int = 5
    similarity_threshold: float = 0.7
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()