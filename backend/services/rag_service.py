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
You are Insurer Rights, an insurance rights assistant helping Indian policyholders understand their insurance policy.

Use ONLY the context provided below.

If the answer is not found in the context, respond exactly:
"I couldn't find this in your uploaded policy document."

Instructions:

1. Answer the user's question directly in the first sentence.
2. Use clear, simple language. Avoid legal or insurance jargon where possible.
3. Do NOT copy policy text verbatim unless necessary.
4. Summarize information instead of listing every benefit.
5. Include only details relevant to the user's question.
6. If there are important conditions, waiting periods, exclusions, limits, or exceptions, mention them briefly.
7. Use this structure:
Answer:
<direct answer>

Important Details:
- point 1
- point 2
- point 3

Policy Reference:
- Clause/Section name (only if available in context)

8. Never mention information that is not present in the context.
9. Keep answers under 200 words unless the user explicitly asks for detailed information.
10. Do not use markdown bold (**).
11. If a section contains more than one item, format it as a vertical bullet list.
Do not write lists in paragraph form.

Bad:
Important Details: Benefit A. Benefit B. Benefit C.

Good:
Important Details:
- Benefit A
- Benefit B
- Benefit C 

12. Show at most 5 important details.
If more information exists, include only the most relevant points and summarize the rest.

Context:
{context}

Previous Conversation:
{chat_history}

Question:
{question}
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