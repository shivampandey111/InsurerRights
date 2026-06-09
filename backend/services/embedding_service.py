from langchain_google_genai import GoogleGenerativeAIEmbeddings
from fastapi import HTTPException
from dotenv import load_dotenv
import os
import time

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def embedding_model():
    return GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-2",
        output_dimensionality=1024,
        api_key=api_key
    )

def get_embeds(chunks:list[str]) -> list[list[float]]:
    try:
        model = embedding_model()
        embeddings = []
        batch_size = 10
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            embeddings.extend(model.embed_documents(batch))
            time.sleep(1)
        return embeddings
    except Exception as e: # Printing the actual exception
        print(e)
        raise
