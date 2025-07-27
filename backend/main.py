from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
PASSWORD = os.environ["SITE_PASSWORD"]
ALLOWED_ORIGINS = os.environ["ALLOWED_ORIGINS"]

client = OpenAI()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGINS],
    allow_headers=["*"],
    allow_methods=["POST"]
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) # type:ignore

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
@limiter.limit("5/minute")
def chat(request: Request, body: ChatRequest, x_api_key: str = Header(None)):
    if x_api_key != PASSWORD:
        raise HTTPException(status_code=401, detail="unauthorized")
    
    completion = client.chat.completions.create(
        model="gpt-4.1-nano-2025-04-14",
        messages=[
            {
                "role":"user",
                "content":body.query
            }
        ]
    )

    reply = completion.choices[0].message.content

    return {"response": reply}

@app.get("/")
def healthcheck():
    return {"response": "looking good michael"}