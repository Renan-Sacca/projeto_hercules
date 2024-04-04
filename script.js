let selectedProtocol = 'tcp';
let selectedFormat = 'ascii';
let ws;
//let sendButton = document.querySelector('.btn-primary');
let sendButton = document.getElementById('botao_enviar');

let saveButton = document.getElementById('saveButton');


let dados_persona = false;
let cliente = 51;
let id_conexao = 1;
let banco = true

$(document).ready(function() {
    $('#server-select').select2();

    $('#server-select').on('change', function() {
        const teste = $(this).val()
        let valorObjeto = JSON.parse(teste);
        selectProtocol(valorObjeto["protocolo"])
        selectFormat(valorObjeto["tipo"])
        banco = valorObjeto["banco"]
        id_conexao = valorObjeto["id_conexao"]
        preencherPacotesSalvos();
    });
});


document.addEventListener("DOMContentLoaded", function() {
    fetch("http://localhost:8000/servers", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"cliente": cliente})
    })
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById("server-select");
        // Ordena os servidores por nome antes de adicionar ao select
        data.sort((a, b) => a.name.localeCompare(b.name));
        data.forEach(server => {
            const option = document.createElement("option");
            option.text = server.name;
            option.value = JSON.stringify({"address": server.address, "protocolo":server.protocolo, "tipo": server.tipo, "banco": server.banco, "id_conexao": server.id_conexao});
            select.appendChild(option);
        });
        // Atualiza o Select2 após adicionar as opções
        $('#' + select.id).select2();
    });
});



// Desabilita o botão de enviar mensagem inicialmente
sendButton.disabled = true;
saveButton.disabled = true;


function enablesendPacotes() {
    var sendPacotes = document.getElementsByClassName('btn_pacotes');
    for (var i = 0; i < sendPacotes.length; i++) {
        sendPacotes[i].disabled = false;
    }
}

// Função para desabilitar o botão de enviar mensagem
function disablesendPacotes() {
    var sendPacotes = document.getElementsByClassName('btn_pacotes');
    for (var i = 0; i < sendPacotes.length; i++) {
        sendPacotes[i].disabled = true;
    }
    //sendPacotes.disabled = true;
}

// Função para habilitar o botão de enviar mensagem
function enableSaveButton() {
    saveButton.disabled = false;
}

// Função para desabilitar o botão de enviar mensagem
function disableSaveButton() {
    saveButton.disabled = true;
}
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

function sendMessage(mensagem) {
    let messageInput = document.getElementById(mensagem);

    let message = messageInput.value;
    if (!message.trim()) return; // Não envia mensagens em branco

    ws.send(message); // Envia a mensagem para o servidor

    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML += `<p>Enviado: ${message}</p>`;
    messageInput.value = '';
    logContainer.scrollTop = logContainer.scrollHeight;
}

function sendMessageSave(mensagem) {
    let messageInput = document.getElementById(mensagem);
    console.log(messageInput)
    let message = messageInput.value;
    ws.send(message); // Envia a mensagem para o servidor
    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML += `<p>Enviado: ${message}</p>`;
    messageInput.value = '';
    logContainer.scrollTop = logContainer.scrollHeight;
}

function receiveMessage(message) {
    const loadingPopup = document.getElementById('loading-popup');
    loadingPopup.style.display = 'none';
    const logContainer = document.getElementById('log-container');
    let logMessage = message.data;
    if (selectedFormat === 'hex') {
        logMessage = hexToString(logMessage);
    }
    logContainer.innerHTML += `<p>Recebido: ${logMessage}</p>`;
    logContainer.scrollTop = logContainer.scrollHeight;
}

function connectWebSocket() {
    let selectedServer;  // Declare selectedServer outside of any block
  
    if (dados_persona) {
      const ip_port = document.getElementById('ip-port-input');
      selectedServer = ip_port.value;
    } else {
      const serverSelect = document.getElementById('server-select');
      opcoes = serverSelect.options[serverSelect.selectedIndex].value;
      let valorObjeto = JSON.parse(opcoes);

      selectedServer = valorObjeto["address"]
      console.log(selectedServer)
    }
    const [server, port] = selectedServer.trim().split(':');  
    const selectedMessageFormat = selectedFormat === 'ascii' ? 'ascii' : 'hex';

    const connectionData = [server, port, selectedProtocol, selectedMessageFormat].join(',');
    
    ws = new WebSocket('ws://localhost:8765');

    ws.onopen = function() {
        // Enviar os dados de conexão formatados para o servidor
        ws.send(connectionData);
        enableSendButton(); // Habilita o botão de enviar mensagem
        updateConnectButtons()
        if (!dados_persona) {
            enableSaveButton();
        }
        $('#server-select').prop('disabled', true);

        enablesendPacotes()

    };

    ws.onmessage = receiveMessage;

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    ws.onclose = function(event) {
        console.log('WebSocket closed:', event);
        disableSendButton(); // Desabilita o botão de enviar mensagem
        disableSaveButton();
        document.getElementById('btn-connect').style.display = 'inline-block';
        document.getElementById('btn-disconnect').style.display = 'none';
        updateConnectButtons()
        $('#server-select').prop('disabled', false);

            
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
        const loadingPopup = document.getElementById('loading-popup');
        loadingPopup.style.display = 'none';
    }
}

function disconnectWebSocket() {
    $('#pacotes-salvos').empty();
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
        const loadingPopup = document.getElementById('loading-popup');
        loadingPopup.style.display = 'block';
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

function toggleCustom() {
    const serverSelect = document.getElementById('churrasquinho');
    const customInput = document.getElementById('custom-ip-container');

    // Toggle visibility based on checkbox state
    if (document.getElementById('custom-ip-checkbox').checked) {
        serverSelect.style.display = 'none';
        customInput.style.display = 'block';
        dados_persona = true


    } else {
        serverSelect.style.display = 'block';
        customInput.style.display = 'none';
        dados_persona = false
    }
}


function saveconection() {
    var info = document.getElementById("ip-port-input").value;
    var nome = prompt("Digite um nome para a informação:", "Nome da informação");

    if (nome != null) {
        fetch('http://localhost:8000/save_connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: nome, informacao: info, "cliente": cliente , "protocolo": selectedProtocol , "tipo": selectedFormat }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar os dados para a API.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta da API:', data);
            alert('Informação salva com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar a informação. Por favor, tente novamente.');
        });
    }
}


function savepacket() {
    var info = document.getElementById("message-input").value;
    var nome = prompt("Digite um nome para o pacote:", "Nome do pacote");

    if (nome != null) {
        fetch('http://localhost:8000/save_packet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "id_conexao": id_conexao, "id_cliente": cliente, "dados": info, "banco": banco, "nome": nome }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar os dados para a API.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta da API:', data);
            preencherPacotesSalvos();
            alert('Informação salva com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar a informação. Por favor, tente novamente.');
        });
    }
}


function ordenarSelectPorTexto(idSelect) {
    var select = $('#' + idSelect);
    var options = select.find('option');
    options.sort(function(a, b) {
        if (a.text > b.text) return 1;
        if (a.text < b.text) return -1;
        return 0;
    });
    select.empty().append(options);
    select.select2(); // Atualiza o Select2
}



function preencherPacotesSalvos() {
    // Construir a URL da requisição com os parâmetros de consulta
    var url = `http://localhost:8000/packets?id_cliente=${cliente}&id_conexao=${id_conexao}&banco=${banco}`;

    // Fazer a requisição usando fetch
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Limpar o container antes de adicionar os novos pacotes
            $('#pacotes-salvos').empty();
            
            // Iterar sobre os dados da API e adicionar cada pacote ao container
            data.forEach(function(pacote) {
                var card = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Nome: ${pacote.nome}</h5>
                            <p class="card-text">${pacote.pacote}</p>
                            <button id='botao_pacotes' class="btn btn-primary btn_pacotes" onclick="sendMessageSave('envia_mensagem${pacote.id}')">Enviar</button>
                            <button id='botao_pacotes' class="btn btn-danger" onclick="del_packet(${pacote.id})">Deletar</button>
                            <input  type="hidden"  id='envia_mensagem${pacote.id}' value="${pacote.pacote}">

                        </div>
                    </div>
                `;
                $('#pacotes-salvos').append(card);
                
            });
            
        })
        .catch(error => {
            console.error('Erro ao obter os pacotes salvos da API:', error);
        });
        setTimeout(function() {
            disablesendPacotes()
            console.log("Ação após um segundo");
        }, 1000);
        
}


function del_packet(id) {
    fetch('http://localhost:8000/del_packet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "id": id}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar os dados para a API.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta da API:', data);
        alert('Informação salva com sucesso!');
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar a informação. Por favor, tente novamente.');
    });
    setTimeout(function() {
        preencherPacotesSalvos()
        console.log("Ação após um segundo");
    }, 1000);
    
}