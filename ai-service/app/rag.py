import httpx
from app.config import settings
from app.embeddings import embed_texts
from app.vector_store import vector_store

def chunk_text(text, chunk_size, overlap):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start = end - overlap
    return chunks

def ingest_document(doc_id, title, content, org_id):
    chunks = chunk_text(content, settings.chunk_size, settings.chunk_overlap)
    if not chunks:
        return 0
    vectors = embed_texts(chunks)
    count = vector_store.add(doc_id, title, chunks, vectors, org_id)
    return count

def retrieve_context(question, top_k, org_id):
    vector = embed_texts([question])[0]
    results = vector_store.search(vector, top_k, org_id)
    return [r for r in results if r["score"] >= settings.similarity_threshold]

async def call_llm(system_prompt, user_prompt):
    if not settings.llm_api_key or "replace" in settings.llm_api_key:
        return "AI generation is not configured yet. Add a valid LLM_API_KEY in ai-service/.env to enable AI drafted replies."
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.llm_api_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.llm_api_key}", "Content-Type": "application/json"},
            json={
                "model": settings.llm_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 500
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

async def generate_answer(question, ticket_context, org_id):
    retrieved = retrieve_context(question, settings.top_k, org_id)
    if retrieved:
        knowledge_text = "\n\n".join([f"[{r['title']}]: {r['text']}" for r in retrieved])
        system_prompt = (
            "You are a helpful, concise customer support assistant. "
            "Use the provided knowledge base context to draft an accurate, friendly reply to the customer. "
            "Keep the reply professional and under 150 words."
        )
    else:
        knowledge_text = ""
        system_prompt = (
            "You are a helpful customer support assistant. No relevant knowledge base articles were found for this question. "
            "Clearly and politely tell the agent that you could not find a relevant answer in the knowledge base, "
            "and suggest the agent investigate manually or escalate. Do not guess or invent a technical solution. Keep it under 80 words."
        )
    user_prompt = f"Conversation so far:\n{ticket_context}\n\nKnowledge base context:\n{knowledge_text}\n\nCustomer question:\n{question}\n\nDraft a reply."
    answer = await call_llm(system_prompt, user_prompt)
    sources = [{"title": r["title"], "snippet": r["text"][:180], "docId": r["doc_id"], "score": r["score"]} for r in retrieved]
    return answer, sources
