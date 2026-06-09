from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from backend.supaBase import get_supabase
from backend.services.embedding_service import embedding_model
import os
from dotenv import load_dotenv

load_dotenv()
supabase = get_supabase()
def chat_model():
    return ChatGoogleGenerativeAI(
        model = "gemini-3.5-flash",
        api_key = os.getenv("GEMINI_API_KEY"),
        temperature = 0.2
    )

# RAG Service: Context + Query 

def get_context(query: str, user_id : str, doc_id : str, supabase) -> list[str]:

    model = embedding_model()
    query_embeds = model.embed_query(query)
    # Similarity search againts the query embeds from the respective doc vectors
    response = supabase.rpc("match_doc_chunks", {
        "query" : query_embeds,
        "user_id_filter" : user_id,
        "doc_id_filter" : doc_id,
        "count" : 5
    }).execute()

    return [row["content"] for row in response.data]

PROMPT_TEMPLATE = """
You are an insurance rights assistant helping Indian policyholders understand their policy.

Use ONLY the context below to answer. If the answer is not in the context, say:
"I couldn't find this in your uploaded policy document."
Rules:
- Keep answers to the point and include relevant details from the context.
- Use bullet points only when necessary.
- If specific policy limits are not directly relevant to the question, omit them.
- Answer in plain, simple language. Reference specific clauses.
Context from policy document:
{context}

Previous conversation:
{chat_history}

Question: {question}

"""
# Final chain that would send the prompt to llm
def build_chain():
    llm = chat_model()
    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

    chain = (
        RunnablePassthrough()
        | prompt
        | llm
    )
    return chain