from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os
import time
import math

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
        batch_size = 5
        total_batch = math.ceil(len(chunks) / batch_size)
        for batch_num, i in enumerate(range(0, len(chunks), batch_size), start=1):
            batch = chunks[i:i + batch_size]

            print(f"Embedding batch {batch_num}/{total_batch}")

            embeddings.extend(model.embed_documents(batch))
            time.sleep(3)

        return embeddings
    except Exception as e: # Printing the actual exception
        print(e)
        raise
