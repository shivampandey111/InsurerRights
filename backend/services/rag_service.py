from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from supaBase import get_supabase
from services.embedding_service import embedding_model
import os, time, sentry_sdk
from dotenv import load_dotenv

load_dotenv()
supabase = get_supabase()
admin_id = os.getenv("ADMIN_USER_ID")

def chat_model():
    return ChatGoogleGenerativeAI(
        model = "gemini-3.5-flash",
        api_key = os.getenv("GEMINI_API_KEY"),
        temperature = 0.2,
        streaming= True
    )

# RAG Service: Context + Query 

def get_context(query: str, user_id : str, doc_id : str, supabase) -> list[str]:
    start = time.time()
    model = embedding_model()

    embed_start = time.time()
    query_embeds = model.embed_query(query)
    embed_ms = (time.time()-embed_start) * 1000

    # Similarity search againts the query embeds from the respective doc vectors
    retrieval_start = time.time()
    response = supabase.rpc("match_doc_chunks", {
        "query" : query_embeds,
        "user_id_filter" : user_id,
        "doc_id_filter" : doc_id,
        "count" : 3
    }).execute()
    retrieval_ms = (time.time() - retrieval_start) * 1000
    latency_ms = (time.time()-start) * 1000
    chunks = response.data

    similarity_score = [r["similarity"] for r in chunks]

    sentry_sdk.set_context("rag_retrieval", {
        "question_length" : len(query),
        "chunks_retrieved" : len(chunks),
        "avg_similarity" : round(sum(similarity_score) / len(similarity_score), 3) if similarity_score else 0,
        "max_similarity" : round(max(similarity_score), 3) if similarity_score else 0,
        "min_similarity" : round(min(similarity_score), 3) if similarity_score else 0,
        "retrieval_latency_ms" : round(latency_ms, 1),
        "embedding_latency_ms" : round(embed_ms, 1),
        "doc_id" : str(doc_id),
        "mode" : "Global" if user_id == admin_id else "Document"
    })
    

    if similarity_score and max(similarity_score) <0.6:
        sentry_sdk.capture_message(
            f"Low Similarity Retrieval: max{max(similarity_score):.3f}",
            level="warning"
        )
    return [r["content"] for r in chunks]

PROMPT_TEMPLATE = """
You are Insurer Rights, an insurance rights assistant helping Indian policyholders understand their insurance policy.

Use the uploaded policy document as the primary source of truth.

Clearly distinguish between:
1. Information found in the policy.
2. General insurance knowledge not taken from the policy.

If the policy document explicitly addresses the question, that answer is final. 
Do not supplement, soften, or contradict it with general insurance knowledge.

If the policy does NOT address the question at all, you may use general 
insurance knowledge ONLY for conceptual or educational explanations 
(e.g. "what is a deductible", "how does co-payment work"). 

In this case, clearly state: "This is not covered in your policy document. 
Generally speaking..."

Never use general knowledge to hedge or qualify something the policy 
states explicitly.

If the user asks for an explanation or detail, explain the question in a detailed manner. 

Never invent policy-specific benefits, exclusions, waiting periods, limits, claim procedures, or coverage details that are not supported by the policy context.

You may make reasonable connections and explanations when they are directly supported by the context.

For example:
- If the context specifies a waiting period for pre-existing diseases, you may apply that information when the user asks about a disease that could fall under that category.
- If the context describes a benefit, you may explain it in simpler language.

Instructions:

1. Answer the user's question directly in the first sentence.
2. Use clear, simple language. Avoid legal or insurance jargon where possible.
3. Do NOT copy policy text verbatim unless necessary.
4. Summarize information instead of listing every benefit.
5. Include only details relevant to the user's question.
6. If there are important conditions, waiting periods, exclusions, limits, or exceptions, mention them briefly.
7. Before answering:
        Identify the policy concept relevant to the question.
        Find the most relevant information in the context.
        Answer using only that information.
8. Use this structure:
<direct answer>

**Important Details**:
- point 1
- point 2
- point 3

**Policy Reference**:
- Clause/Section name (only if available in context)

9. When retrieving context, match the exact concept first. Only broaden to a related category if no direct match exists AND the category unambiguously covers the case. If uncertain, say: "Your policy does not directly address this. The closest relevant section is [X], 
which states..."

10. Keep answers under 200 words unless the user explicitly asks for detailed information.
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