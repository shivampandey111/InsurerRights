from fastapi import APIRouter, Depends
from routers.dependencies import get_current_user
from fastapi.responses import StreamingResponse
from supaBase import get_supabase
from services.rag_service import get_context, build_chain
from pydantic import BaseModel
import json
router = APIRouter()

class Query(BaseModel):
    question : str
    doc_id : str
def get_chat_hisory(doc_id : str, user_id : str, supabase) -> str:
    result = (
        supabase.table("chat_history")
        .select("role, content")
        .eq("user_id", user_id)
        .eq("doc_id", doc_id)
        .order("created_at", desc=True)
        .limit(4)
        .execute()
    )
    messages = list(reversed(result.data))
    return "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])

@router.post("/api/query")
async def process_query(
    req: Query, 
    user_id = Depends(get_current_user)
    ):
    supabase = get_supabase()
    chunks = get_context(req.question, user_id, req.doc_id, supabase)

    if not chunks:
        return {"answer" : "No relevant context found among your document"}
    
    context = "\n\n---\n\n".join(chunks)
    chat_history = get_chat_hisory(req.doc_id, user_id, supabase)
    chain = build_chain()
 
    async def get_response():
        full_response = ""
        async for chunk in chain.astream({
            "context" : context,
            "chat_history" : chat_history,
            "question" : req.question
        }):
            token = ''
            for item in chunk.content:
                if item.get("type") == "text":
                    token += item.get("text", "")
            full_response += token

        supabase.table("chat_history").insert([
            {"user_id": user_id, "doc_id":req.doc_id, 
             "role" : "user", "content" : req.question},
             {"user_id":user_id, "doc_id":req.doc_id,
              "role":"assistant", "content": full_response}
        ]).execute()

        yield f'data: {json.dumps({"done" : True})}\n\n'

    return StreamingResponse(get_response(), media_type="text/event-stream")
            
    