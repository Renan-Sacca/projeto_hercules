from fastapi import FastAPI
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from db import db_mysql
app = FastAPI()

# Após a criação do app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pode ser restrito a um domínio específico ou uma lista de domínios
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

servers = db_mysql.busca_ips()

@app.get("/servers", response_model=List[dict])
async def get_servers():
    return servers