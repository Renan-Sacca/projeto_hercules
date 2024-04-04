from fastapi import FastAPI, HTTPException, Query
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from db import db_mysql
from pydantic import BaseModel

app = FastAPI()
class Cliente(BaseModel):
    cliente: int

class Connection(BaseModel):
    nome: str
    informacao: str
    cliente: int
    protocolo: str
    tipo: str

class Packet(BaseModel):
    id_conexao: int
    id_cliente: int
    dados: str
    banco: int
    nome: str

class get_Packet(BaseModel):
    id_cliente: int
    id_conexao: int

class del_Packet(BaseModel):
    id: int

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

@app.get("/packets", response_model=List[dict])
async def get_packets(id_cliente: int = Query(..., description="ID do cliente"),
                       id_conexao: int = Query(..., description="ID da conexão"),
                       banco: bool = Query(..., description="banco")):
    packet = {"id_cliente": id_cliente, "id_conexao": id_conexao, "banco": banco}
    packets = db_mysql.busca_packets(packet)
    return packets

@app.post("/del_packet", response_model=List[dict])
async def get_servers(dado: del_Packet):
    try:
        db_mysql.exclui_packets(dado.id)
        return [{"message": "Packet removido com sucesso."}]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/servers", response_model=List[dict])
async def get_servers(cliente: Cliente):
    servidores_completo = servers + db_mysql.server_cliente(cliente.cliente)
    print(servidores_completo)
    print(servers)
    return servidores_completo


@app.post("/save_connection", response_model=Dict[str, str])
async def save_server(dados: Connection):
    try:
        db_mysql.salvar_informacao(dados)
        return {"message": "Conexão salva com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save_packet", response_model=Dict[str, str])
async def save_server(dados: Packet):
    try:
        db_mysql.salvar_pacote(dados)
        return {"message": "Pacote salvo com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
