from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class DocumentChunk(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    namespace: str


class UploadResponse(BaseModel):
    success: bool
    message: str
    document_id: Optional[str] = None
    chunks_created: Optional[int] = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    document_id: Optional[str] = None
    include_guidelines: bool = True


class SourceReference(BaseModel):
    source: str
    page: Optional[int] = None
    chapter: Optional[str] = None
    similarity_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceReference]
    processing_time: float
    timestamp: datetime = Field(default_factory=datetime.now)


class DocumentInfo(BaseModel):
    id: str
    filename: str
    upload_date: datetime
    chunks_count: int
    status: str


class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, bool]