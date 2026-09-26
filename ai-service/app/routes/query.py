from fastapi import APIRouter
from app.schemas import QueryRequest, QueryResponse
from app.rag import generate_answer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query(payload: QueryRequest):
    answer, sources = await generate_answer(payload.question, payload.context or "", payload.org_id)
    return QueryResponse(answer=answer, sources=sources)
