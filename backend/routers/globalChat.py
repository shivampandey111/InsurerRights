from fastapi import APIRouter, Depends
from routers.dependencies import get_current_user
from supaBase import get_supabase
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.global_chat_service import build_chain
import json

router = APIRouter()
supabase = get_supabase()

class Query(BaseModel):
    question: str

def get_chat_hisory(user_id : str, supabase) -> str:
    result = (
        supabase.table("global_chats")
        .select("role, content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    messages = list(reversed(result.data))
    return "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])

@router.post('/api/globalChat')
async def global_Chat(
    req : Query,
    user_id = Depends(get_current_user)
):
    history = get_chat_hisory(user_id, supabase)
    chain = build_chain()

    async def get_response():
        full_response = ""
        async for chunk in chain.astream({
            "history" : history,
            "question" : req.question
        }):
            token = ''
            for item in chunk.content:
                if item.get("type") == "text":
                    token += item.get("text", "")
                full_response += token
            
            yield f'data: {json.dumps({"token" : token}, ensure_ascii=False)}\n\n'
        
        supabase.table("global_chats").insert([
            {"user_id": user_id, "role": "user", "content" : req.question},
            {"user_id" : user_id, "role": "assistant", "content" : full_response}
        ]).execute()

    return StreamingResponse(get_response(), media_type="text/event-stream")



