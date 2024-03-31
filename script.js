let selectedProtocol = 'tcp';
let selectedFormat = 'ascii';
let ws;
let messageInput = document.getElementById('message-input');
let sendButton = document.querySelector('.btn-primary');

// Desabilita o botão de enviar mensagem inicialmente
sendButton.disabled = true;

// Função para habilitar o botão de enviar mensagem
function enableSendButton() {
    sendButton.disabled = false;
}

// Função para desabilitar o botão de enviar mensagem
function disableSendButton() {
    sendButton.disabled = true;
}

function selectProtocol(protocol) {
    if (protocol === selectedProtocol) return;

    const tcpBtn = document.getElementById('btn-tcp');
    const udpBtn = document.getElementById('btn-udp');

    if (protocol === 'tcp') {
        tcpBtn.classList.add('active');
        udpBtn.classList.remove('active');
    } else {
        udpBtn.classList.add('active');
        tcpBtn.classList.remove('active');
    }

    selectedProtocol = protocol;
}

function selectFormat(format) {
    if (format === selectedFormat) return;

    const asciiBtn = document.getElementById('btn-ascii');
    const hexBtn = document.getElementById('btn-hex');

    if (format === 'ascii') {
        asciiBtn.classList.add('active');
        hexBtn.classList.remove('active');
    } else {
        hexBtn.classList.add('active');
        asciiBtn.classList.remove('active');
    }

    selectedFormat = format;
}

function sendMessage() {
    let message = messageInput.value;
    if (!message.trim()) return; // Não envia mensagens em branco

    ws.send(message); // Envia a mensagem para o servidor

    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML += `<p>Enviado: ${message}</p>`;
    messageInput.value = '';
    logContainer.scrollTop = logContainer.scrollHeight;
}

function receiveMessage(message) {
    const logContainer = document.getElementById('log-container');
    let logMessage = message.data;
    if (selectedFormat === 'hex') {
        logMessage = hexToString(logMessage);
    }
    logContainer.innerHTML += `<p>Recebido: ${logMessage}</p>`;
    logContainer.scrollTop = logContainer.scrollHeight;
}

function connectWebSocket() {
    const serverSelect = document.getElementById('server-select');
    const selectedServer = serverSelect.options[serverSelect.selectedIndex].value;
    const [server, port] = selectedServer.split(':');
    const selectedMessageFormat = selectedFormat === 'ascii' ? 'ascii' : 'hex';

    const connectionData = [server, port, selectedProtocol, selectedMessageFormat].join(',');
    
    ws = new WebSocket('ws://localhost:8765');

    ws.onopen = function() {
        // Enviar os dados de conexão formatados para o servidor
        ws.send(connectionData);
        enableSendButton(); // Habilita o botão de enviar mensagem
        updateConnectButtons()
    };

    ws.onmessage = receiveMessage;

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    ws.onclose = function(event) {
        console.log('WebSocket closed:', event);
        disableSendButton(); // Desabilita o botão de enviar mensagem
        document.getElementById('btn-connect').style.display = 'inline-block';
        document.getElementById('btn-disconnect').style.display = 'none';
        updateConnectButtons()
            
    };

    document.getElementById('btn-connect').style.display = 'none';
            document.getElementById('btn-disconnect').style.display = 'inline-block';
       
}

function updateConnectButtons() {
    const btnConnect = document.getElementById('btn-connect');
    const btnDisconnect = document.getElementById('btn-disconnect');
    const btnGroup = document.querySelector('.btn-group');

    if (ws && ws.readyState === WebSocket.OPEN) {
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        btnGroup.style.display = 'none'; // Esconde os botões de protocolo e tipo
    } else {
        btnConnect.style.display = 'inline-block';
        btnDisconnect.style.display = 'none';
        btnGroup.style.display = 'block'; // Mostra os botões de protocolo e tipo
    }
}

function disconnectWebSocket() {
    if (ws) {
        ws.close();
        disableSendButton(); // Desabilita o botão de enviar mensagem
    }
}

function toggleConnection() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        disconnectWebSocket();
    } else {
        connectWebSocket();
    }
}

function saveLog() {
    const logContainer = document.getElementById('log-container');
    const logContent = logContainer.innerText;
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

