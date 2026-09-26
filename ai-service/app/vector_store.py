import os
import pickle
import threading
import numpy as np
import faiss
from app.config import settings

DIM = 384

class VectorStore:
    def __init__(self, path):
        self.path = path
        self.index_path = os.path.join(path, "index.faiss")
        self.meta_path = os.path.join(path, "meta.pkl")
        self.lock = threading.Lock()
        self.metadata = {}
        self.next_id = 0
        os.makedirs(path, exist_ok=True)
        self._load()

    def _load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, "rb") as f:
                data = pickle.load(f)
                self.metadata = data["metadata"]
                self.next_id = data["next_id"]
        else:
            base = faiss.IndexFlatIP(DIM)
            self.index = faiss.IndexIDMap2(base)

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "wb") as f:
            pickle.dump({"metadata": self.metadata, "next_id": self.next_id}, f)

    def add(self, doc_id, title, chunks, vectors, org_id):
        with self.lock:
            ids = []
            for i, chunk in enumerate(chunks):
                cid = self.next_id
                self.next_id += 1
                self.metadata[cid] = {"doc_id": doc_id, "title": title, "text": chunk, "org_id": org_id}
                ids.append(cid)
            ids_np = np.array(ids, dtype="int64")
            vectors_np = np.array(vectors, dtype="float32")
            self.index.add_with_ids(vectors_np, ids_np)
            self._save()
            return len(ids)

    def delete_doc(self, doc_id):
        with self.lock:
            ids_to_remove = [cid for cid, meta in self.metadata.items() if meta["doc_id"] == doc_id]
            if not ids_to_remove:
                return 0
            ids_np = np.array(ids_to_remove, dtype="int64")
            self.index.remove_ids(ids_np)
            for cid in ids_to_remove:
                del self.metadata[cid]
            self._save()
            return len(ids_to_remove)

    def search(self, vector, top_k, org_id):
        with self.lock:
            if self.index.ntotal == 0:
                return []
            fetch_k = min(self.index.ntotal, max(top_k * 10, 50))
            vector_np = np.array([vector], dtype="float32")
            scores, ids = self.index.search(vector_np, fetch_k)
            results = []
            for score, cid in zip(scores[0], ids[0]):
                if cid == -1:
                    continue
                meta = self.metadata.get(int(cid))
                if meta and meta.get("org_id") == org_id:
                    results.append({"score": float(score), **meta})
                if len(results) >= top_k:
                    break
            return results

vector_store = VectorStore(settings.vector_store_path)
