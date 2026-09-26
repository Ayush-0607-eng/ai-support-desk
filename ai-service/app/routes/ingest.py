from fastapi import APIRouter
from app.schemas import IngestRequest, IngestResponse
from app.rag import ingest_document
from app.vector_store import vector_store

router = APIRouter()

@router.post("/ingest", response_model=IngestResponse)
def ingest(payload: IngestRequest):
    count = ingest_document(payload.doc_id, payload.title, payload.content, payload.org_id)
    return IngestResponse(doc_id=payload.doc_id, chunk_count=count, status="indexed")

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    removed = vector_store.delete_doc(doc_id)
    return {"doc_id": doc_id, "removed_chunks": removed}
