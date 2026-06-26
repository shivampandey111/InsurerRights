from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supaBase import get_supabase

security = HTTPBearer()

async def get_current_user(
        # Extracts the JWT from auth header and verifies it from supabase and return a uuid as str

        credentials : HTTPAuthorizationCredentials = Depends(security),
        supabase = Depends(get_supabase)
) -> str :
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        user = response.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        return str(user.id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )