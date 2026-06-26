from fastapi import FastAPI
import sentry_sdk, os
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, query, upload, docs, history, globalChat, admin_upload

load_dotenv()

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration(), StarletteIntegration()],
    traces_sample_rate=1.0
)

app = FastAPI(title="Insurer Rights")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["https://insurer-rights.vercel.app/"],
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
    globalChat.router,
    tags=['Global Assistant']
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
app.include_router(
    admin_upload.router,
    tags=['Admin Upload']
)

@app.get('/api/health')
def health():
    return {'status':'ok'}