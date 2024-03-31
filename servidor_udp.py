import socket
from datetime import datetime

# Cria um socket UDP
udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Liga o socket ao endereço e porta desejados
udp_socket.bind(('localhost', 65432))

print('Servidor UDP pronto para receber mensagens...')

while True:
    # Recebe a mensagem do cliente e o endereço do cliente
    data, address = udp_socket.recvfrom(1024)

    print(f'Mensagem recebida de {address}: {data.decode()}')

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    message = f"{now} - Mensagem recebida em udp: {data.decode()}"
    # Envia a mensagem de volta para o cliente
    udp_socket.sendto(message.encode(), address)

# Fecha o socket
udp_socket.close()
