# services/ai/embeddingService.py
from sentence_transformers import SentenceTransformer
import sys
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

# Load model once at startup
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def generate_embedding(text):
    """Generate embedding for text with error handling"""
    if not text or not isinstance(text, str):
        logger.error("Invalid input text for embedding")
        return None
    
    try:
        logger.info("Generating embedding...")
        embedding = model.encode(text).tolist()
        logger.info("Embedding generated successfully")
        return embedding
    except Exception as e:
        logger.error(f"Embedding generation failed: {str(e)}")
        return None

if __name__ == "__main__":
    try:
        # Read input from command line
        input_text = sys.argv[1]
        result = generate_embedding(input_text)
        print(json.dumps(result))
    except Exception as e:
        logger.error(f"Script failed: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)