from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException
from supaBase import get_supabase
from dotenv import load_dotenv
import os
router = APIRouter()
load_dotenv()

supabase = get_supabase()

class RegisterUser(BaseModel):
    email : EmailStr
    password : str = Field(min_length=8)

class LoginUser(BaseModel):
    email : EmailStr
    password : str

# Register User

@router.post('/register')
async def register_user(user:RegisterUser):

    try:
        response = supabase.auth.sign_up({
            "email" : user.email,
            "password" : user.password
        })
        return {
            "message" : "User Created Successfully",
            "user_id" : response.user.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# Login User

@router.post('/login')
async def loginUser(user:LoginUser):
    try:
        response = supabase.auth.sign_in_with_password({
            "email" : user.email,
            "password" : user.password
        })
        return {
            "access_token" : response.session.access_token,
            "refresh_token" : response.session.refresh_token,
            "user_id" : response.user.id,
            "message" : "User Logged In Successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=501,
            detail= str(e)
        )
    
# Logout
@router.post('/logOut')
async def logOut():
    return {
        "message" : "Remove access and refresh tokens"
    }