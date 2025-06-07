import chromadb
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from loguru import logger
import uuid
import os


class VectorStore:
    def __init__(self, persist_directory: str = "./data/chroma_db"):
        self.persist_directory = persist_directory
        self.client = None
        self.embedding_model = None
        self._initialize()
    
    def _initialize(self):
        """Initialize ChromaDB client and embedding model."""
        try:
            # Create directory if it doesn't exist
            os.makedirs(self.persist_directory, exist_ok=True)
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info("Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            raise
    
    def get_or_create_collection(self, collection_name: str):
        """Get or create a collection in ChromaDB."""
        try:
            return self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            logger.error(f"Error creating collection {collection_name}: {e}")
            raise
    
    def add_documents(self, documents: List[Dict[str, Any]], collection_name: str = "documents"):
        """Add documents to the vector store."""
        try:
            collection = self.get_or_create_collection(collection_name)
            
            # Prepare data for ChromaDB
            ids = []
            documents_text = []
            metadatas = []
            
            for doc in documents:
                doc_id = doc.get('id', str(uuid.uuid4()))
                ids.append(doc_id)
                documents_text.append(doc['content'])
                metadatas.append(doc.get('metadata', {}))
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(documents_text).tolist()
            
            # Add to collection
            collection.add(
                ids=ids,
                documents=documents_text,
                metadatas=metadatas,
                embeddings=embeddings
            )
            
            logger.info(f"Added {len(documents)} documents to collection {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding documents to vector store: {e}")
            raise
    
    def search_similar_documents(
        self, 
        query: str, 
        collection_name: str = "documents",
        namespace_filter: Optional[str] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        try:
            collection = self.get_or_create_collection(collection_name)
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()[0]
            
            # Prepare where filter for namespace
            where_clause = {}
            if namespace_filter:
                where_clause["namespace"] = namespace_filter
            
            # Search
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_clause if where_clause else None
            )
            
            # Format results
            formatted_results = []
            if results['documents'][0]:  # Check if results exist
                for i in range(len(results['documents'][0])):
                    similarity_score = 1 - results['distances'][0][i]  # Convert distance to similarity
                    
                    if similarity_score >= similarity_threshold:
                        formatted_results.append({
                            'id': results['ids'][0][i],
                            'content': results['documents'][0][i],
                            'metadata': results['metadatas'][0][i],
                            'similarity_score': similarity_score
                        })
            
            logger.info(f"Found {len(formatted_results)} similar documents for query")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching similar documents: {e}")
            return []
    
    def search_multiple_namespaces(
        self,
        query: str,
        namespaces: List[str],
        collection_name: str = "documents",
        top_k_per_namespace: int = 3
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Search across multiple namespaces."""
        results = {}
        
        for namespace in namespaces:
            results[namespace] = self.search_similar_documents(
                query=query,
                collection_name=collection_name,
                namespace_filter=namespace,
                top_k=top_k_per_namespace
            )
        
        return results
    
    def delete_documents_by_namespace(self, namespace: str, collection_name: str = "documents"):
        """Delete all documents in a specific namespace."""
        try:
            collection = self.get_or_create_collection(collection_name)
            
            # Get all documents in the namespace
            results = collection.get(where={"namespace": namespace})
            
            if results['ids']:
                collection.delete(ids=results['ids'])
                logger.info(f"Deleted {len(results['ids'])} documents from namespace {namespace}")
                return len(results['ids'])
            
            return 0
            
        except Exception as e:
            logger.error(f"Error deleting documents from namespace {namespace}: {e}")
            raise
    
    def get_collection_stats(self, collection_name: str = "documents") -> Dict[str, Any]:
        """Get statistics about the collection."""
        try:
            collection = self.get_or_create_collection(collection_name)
            count = collection.count()
            
            # Get namespace distribution
            all_docs = collection.get()
            namespace_counts = {}
            
            if all_docs['metadatas']:
                for metadata in all_docs['metadatas']:
                    namespace = metadata.get('namespace', 'unknown')
                    namespace_counts[namespace] = namespace_counts.get(namespace, 0) + 1
            
            return {
                'total_documents': count,
                'namespace_distribution': namespace_counts,
                'collection_name': collection_name
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {'error': str(e)}