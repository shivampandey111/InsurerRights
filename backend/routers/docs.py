from fastapi import APIRouter, Depends
from backend.supaBase import get_supabase
from backend.routers.dependencies import get_current_user

router = APIRouter()

@router.get('/api/documents')
async def get_docs(
    user_Id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table('documents')
        .select("filename", "id", "created_at")
        .eq('user_id', user_Id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
