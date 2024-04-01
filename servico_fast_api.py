from fastapi import FastAPI
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Após a criação do app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pode ser restrito a um domínio específico ou uma lista de domínios
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


servers = [
    {"name": "Steste 1", "address": "localhost:65432"},
    {"name": "xablau 2", "address": "192.168.0.1:4000"}
]

@app.get("/servers", response_model=List[dict])
async def get_servers():
    return servers