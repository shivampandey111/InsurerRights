from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, query, upload, docs, history

app = FastAPI(title="Insurer Rights")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_headers = ['*'],
    allow_methods = ['*']
)

# Register Routes from router file
app.include_router(
    docs.router,
    tags=['Docs']
)
app.include_router(
    history.router,
    tags=['History']
)

app.include_router(
    auth.router,
    prefix='/auth',
    tags = ['Auth']
)
app.include_router(
    query.router,
    tags=['Query']
)
app.include_router(
    upload.router,
    tags=['Upload']
)

@app.get('/api/health')
def health():
    return {'status':'ok'}