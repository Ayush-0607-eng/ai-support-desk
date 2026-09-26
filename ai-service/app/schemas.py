from pydantic import BaseModel
from typing import List, Optional

class IngestRequest(BaseModel):
    title: str
    content: str
    doc_id: str
    org_id: str

class IngestResponse(BaseModel):
    doc_id: str
    chunk_count: int
    status: str

class QueryRequest(BaseModel):
    question: str
    context: Optional[str] = ""
    org_id: str

class SourceItem(BaseModel):
    title: str
    snippet: str
    docId: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceItem]
