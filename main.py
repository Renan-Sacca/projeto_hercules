from servico_web_socket import handle_websocket
import asyncio
import websockets
import threading
import uvicorn
from servico_fast_api import app

def run_websocket_server():
    asyncio.set_event_loop(asyncio.new_event_loop())  # Cria um novo loop de eventos asyncio na thread
    start_server = websockets.serve(handle_websocket, "localhost", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

def run_http_server():
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Inicie os servidores em threads separadas
websocket_thread = threading.Thread(target=run_websocket_server)
http_thread = threading.Thread(target=run_http_server)

websocket_thread.start()
http_thread.start()

# Aguarde as threads terminarem
websocket_thread.join()
http_thread.join()