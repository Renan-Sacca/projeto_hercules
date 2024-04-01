import asyncio
import websockets
import socket
import time

async def handle_websocket(websocket, path):
    # Recebe a primeira mensagem do cliente WebSocket
    option = await websocket.recv()
    print(f"Opção recebida: {option}")

    # Função para criar uma conexão TCP
    def create_tcp_connection():
        tcp_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tcp_client.connect(("localhost", 8888))  # Adaptar para o IP e porta desejados
        return tcp_client

    # Função para criar uma conexão UDP
    def create_udp_connection():
        udp_client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return udp_client

    # Cria a conexão inicial com base na opção recebida
    if option == "tcp":
        client = create_tcp_connection()
    elif option == "udp":
        client = create_udp_connection()
    else:
        print("Opção inválida. Fechando conexão.")
        await websocket.close()
        return

    try:
        while True:
            # Recebe mensagem do cliente WebSocket
            message = await websocket.recv()
            print(f"Mensagem recebida do WebSocket: {message}")

            # Envia mensagem para o servidor TCP ou UDP
            try:
                client.sendall(message.encode())
                # Recebe resposta do servidor TCP ou UDP e envia de volta para o cliente WebSocket
                response = client.recv(1024)
                await websocket.send(response.decode())
            except (ConnectionResetError, BrokenPipeError):
                print(f"Conexão {option.upper()} perdida. Tentando reconectar...")
                client.close()
                while True:
                    try:
                        if option == "tcp":
                            client = create_tcp_connection()
                        elif option == "udp":
                            client = create_udp_connection()
                        print(f"Reconexão {option.upper()} bem-sucedida.")
                        break
                    except ConnectionRefusedError:
                        print(f"Tentativa de reconexão {option.upper()} falhou. Tentando novamente em 1 segundo...")
                        time.sleep(1)

    finally:
        client.close()

start_server = websockets.serve(handle_websocket, "localhost", 8765)  # Adaptar para o IP e porta desejados

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
