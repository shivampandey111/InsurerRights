from fastapi import APIRouter, Depends, HTTPException
from supaBase import get_supabase
from routers.dependencies import get_current_user

router = APIRouter()
supabase = get_supabase()

@router.get('/api/documents')
async def get_docs(
    user_Id: str = Depends(get_current_user)):
    result = (
        supabase.table('documents')
        .select("filename", "id", "created_at", "storage_used_mb")
        .eq('user_id', user_Id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data

@router.delete('/documents/delete/{doc_id}')
async def del_docs(
    doc_id = str,
    user_Id : str = Depends(get_current_user)
):
    doc = (
        supabase.table("documents")
        .select("*")
        .eq("id", doc_id)
        .eq("user_id", user_Id)
        .execute()
    )
    if not doc.data:
        raise HTTPException(
            status_code=404,
            detail="Document Not Found"
        )
    # Deletion
    response = (
        supabase.table("documents")
        .delete()
        .eq("id", doc_id)
        .execute()
    )
    return {
        "response" : response.data,
        "message" : "doc deleted",
        "doc_id" : doc_id,
        "doc" : doc.data[0]["filename"]
    }
    