from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = 8000
    api_key: str = ""
    embedding_model_name: str = "all-MiniLM-L6-v2"
    vector_store_path: str = "./data/vector_store"
    llm_api_base_url: str = "https://api.groq.com/openai/v1"
    llm_api_key: str = ""
    llm_model: str = "llama-3.1-8b-instant"
    chunk_size: int = 800
    chunk_overlap: int = 100
    top_k: int = 4
    similarity_threshold: float = 0.25

    class Config:
        env_file = ".env"

settings = Settings()
