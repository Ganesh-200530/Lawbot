import json
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RAGService:
    def __init__(self, data_path):
        self.data_path = data_path
        self.data = []
        self.questions = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self._load_data()
        self._build_index()

    def _load_data(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
                # Combine question and answer for richer search context
                self.search_index = [
                    f"{item.get('question', '')} {item.get('answer', '')}" 
                    for item in self.data
                ]
        else:
            print(f"Warning: Data file not found at {self.data_path}")

    def _build_index(self):
        if not self.search_index:
            return
        print("Building TF-IDF Index...")
        self.vectorizer = TfidfVectorizer(stop_words='english')
        # Fit on the combined text
        self.tfidf_matrix = self.vectorizer.fit_transform(self.search_index)
        print("Index Built.")

    def search(self, query, top_k=3):
        if not self.vectorizer or not self.search_index:
            return []

        query_vec = self.vectorizer.transform([query])

        cosine_similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top_k indices
        related_docs_indices = cosine_similarities.argsort()[:-top_k:-1]
        
        results = []
        for idx in related_docs_indices:
            if cosine_similarities[idx] > 0.1: # Threshold to filter irrelevant results
                results.append(self.data[idx])
        
        return results

# Singleton instance
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'IndicLegalQA Dataset_10K_Revised.json')
rag_service = RAGService(DATA_FILE)
