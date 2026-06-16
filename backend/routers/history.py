from fastapi import APIRouter, Depends
from backend.supaBase import get_supabase
from backend.routers.dependencies import get_current_user

router = APIRouter()
supabase = get_supabase()

@router.get('/history/{doc_id}')
async def get_history(
    doc_id : str,
    user_id: str = Depends(get_current_user)
):
    result = (
        supabase.table("chat_history")
        .select('*')
        .eq("user_id", user_id)
        .eq("doc_id", doc_id)
        .order("created_at")
        .execute()
        )
    return result.data