import sys
import json
import os
import fitz  # PyMuPDF
from docx import Document
from embeddingService import generate_embedding
import psycopg2
from dotenv import load_dotenv
import logging

def extract_text(file_path):
    """Extract text from a PDF using PyMuPDF (fitz)"""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)  # Log to stderr to avoid corrupting stdout
    ]
)
logger = logging.getLogger(__name__)


def extract_text(file_path):
    """Extract text from a PDF using PyMuPDF (fitz)"""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text



def process_cv(file_path, user_id):
    try:
        # Normalize and resolve the path
        abs_path = os.path.abspath(os.path.normpath(file_path))
        logger.info(f"Absolute file path: {abs_path}")
        logger.info(f"Current working directory: {os.getcwd()}")
        
        if not os.path.exists(abs_path):
            dir_path = os.path.dirname(abs_path)
            logger.error(f"File not found at: {abs_path}")
            logger.error(f"Directory contents: {os.listdir(dir_path)}")
            return {'error': f'File does not exist at {abs_path}'}

        logger.info(f"File exists, extension: {os.path.splitext(file_path)[1]}")
        
        # Text extraction
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            logger.info("Extracting from PDF")
            text = extract_text(file_path)
        elif ext == '.docx':
            logger.info("Extracting from DOCX")
            doc = Document(file_path)
            text = '\n'.join([p.text for p in doc.paragraphs])
        else:
            logger.error(f"Unsupported format: {ext}")
            return {'error': 'Unsupported file format'}

        logger.info(f"Text extracted (first 100 chars): {text[:100]}...")

        logger.info("Generating embedding")
        embedding = generate_embedding(text)
        if embedding is None:
            logger.error("Embedding generation failed")
            return {'error': 'Embedding generation failed'}

        logger.info("Embedding generated successfully")

        # Database connection
        load_dotenv()
        db_url = os.getenv('DB_URL')
        if not db_url:
            logger.error("DB_URL not loaded from .env")
            raise ValueError("DB_URL not configured")

        logger.info("Connecting to database")
        conn = psycopg2.connect(db_url) 
        cur = conn.cursor()

        # Skip database update if user_id is not a valid integer
        try:
            user_id_int = int(user_id)
        except ValueError:
            logger.info(f"Skipping database update: user_id '{user_id}' is not an integer")
            return {'success': True, 'embedding': embedding}

        cur.execute("""
            UPDATE applicant 
            SET cv = %s, cv_embedding = %s 
            WHERE id = %s
            """, (text, embedding, user_id_int))
        conn.commit()

        return {'success': True, 'embedding': embedding}

    except Exception as e:
        logger.error(f"Error in process_cv: {str(e)}", exc_info=True)
        return {'error': str(e)}
    finally:
        if 'conn' in locals():
            conn.close()
            logger.info("Database connection closed")

if __name__ == '__main__':
    try:
        logger.info("Python script started")
        args = json.loads(sys.argv[1])
        logger.info(f"Received arguments: {args}")
        
        result = process_cv(args['file_path'], args['user_id'])
        
        logger.info("Script completed successfully")
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Fatal error in main: {str(e)}", exc_info=True)
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
        sys.exit(1)