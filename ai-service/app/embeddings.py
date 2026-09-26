from sentence_transformers import SentenceTransformer
from app.config import settings

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model_name)
    return _model

def embed_texts(texts):
    model = get_model()
    vectors = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return vectors
