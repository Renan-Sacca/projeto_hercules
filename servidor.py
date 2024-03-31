import socket
import threading
from datetime import datetime

HOST = '127.0.0.1'  # Endereço IP do servidor
PORT = 65432        # Porta utilizada pelo servidor

def handle_client(conn, addr):
    print(f"Conectado por {addr}")

    with conn:
        while True:
            data = conn.recv(1024)
            if not data:
                print(f"Cliente {addr} desconectado")
                break
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = f"{now} - Mensagem recebida em tcp: {data.decode()}"
            print(message)
            conn.sendall(message.encode())

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print(f"Servidor ouvindo em {HOST}:{PORT}")

    while True:
        conn, addr = s.accept()
        threading.Thread(target=handle_client, args=(conn, addr)).start()
