import pymysql

def cria_conexao():
    db = pymysql.connect(host="localhost",
                                     port=3306,
                                     user="user",
                                     passwd="1234",
                                     db="rastreador",
                                     autocommit=True
                                     )


    return db

def busca_ips():
    db = cria_conexao()
    cursor = db.cursor()
    cursor.execute('''
        SELECT 
            rp.ras_prd_desc AS name,
            IFNULL(CONCAT(cr.dns, ':', cr.porta), CONCAT(cr.ip, ':', cr.porta)) AS address,
            cr.protocolo,
            cr.tipo,
            rp.ras_prd_id
        FROM 
            ras_produto rp
        JOIN 
            configuracao_rastreador cr ON rp.ras_prd_id = cr.id_produto
        WHERE 
            cr.porta IS NOT NULL
            AND (cr.ip IS NOT NULL OR cr.dns IS NOT NULL)
            AND cr.protocolo IN ('UDP', 'TCP', 'UDP/TCP')
            AND cr.tipo IN ('ASCII', 'Hex', 'ASCII/Hex')
    ''')
    resultados = cursor.fetchall()
    servers = []
    for resultado in resultados:
        protocolo = "tcp" if resultado[2].lower() in ["tcp", "udp/tcp"] else "udp"
        tipo = "hex" if resultado[3].lower() in ["hex", "ascii/hex"] else "ascii"
        server = {'name': resultado[0], 'address': resultado[1], 'protocolo': protocolo, 'tipo': tipo, "banco": True, "id_conexao": resultado[4]}
        servers.append(server)

    cursor.close()
    db.close()

    return servers

def salvar_informacao(dados):
    db = cria_conexao()
    cursor = db.cursor()
    print(dados)
    sql = "INSERT INTO conexoes_salvas (id_cliente, nome, ip, porta, protocolo, tipo_mensagem) VALUES (%s, %s, %s, %s, %s, %s)"
    ip, porta = dados.informacao.split(":")
    valores = (dados.cliente, dados.nome, ip, porta, dados.protocolo, dados.tipo)
    cursor.execute(sql, valores)
    cursor.close()
    db.close()
    return

def server_cliente(cliente):
    lista = []
    db = cria_conexao()
    cursor = db.cursor()
    sql = ('''SELECT nome,  CONCAT(ip, ':', porta) AS address, protocolo, tipo_mensagem, id from conexoes_salvas where id_cliente = %s''')
    cursor.execute(sql, cliente)
    resultados = cursor.fetchall()
    for resultado in resultados:
        print(resultado[2])
        server = {'name': resultado[0], 'address': resultado[1], 'protocolo': resultado[2].lower(), 'tipo': resultado[3].lower(), "banco": False, "id_conexao": resultado[4] }
        lista.append(server)

    cursor.close()
    db.close()

    return lista

def salvar_pacote(dados):
    db = cria_conexao()
    cursor = db.cursor()
    sql = "INSERT INTO pacotes_enviados (id_conexao, id_cliente ,dados, banco_padrao, nome ) VALUES (%s, %s, %s, %s, %s)"
    valores = (dados.id_conexao, dados.id_cliente , dados.dados, True if dados.banco == 1 else False, dados.nome)
    cursor.execute(sql, valores)
    cursor.close()
    db.close()
    return

def busca_packets(dados):
    lista = []
    db = cria_conexao()
    cursor = db.cursor()
    sql = (
        '''SELECT id, dados, nome from pacotes_enviados where id_cliente = %s and id_conexao = %s and banco_padrao = %s and deletado = 0''')
    values = (dados["id_cliente"], dados["id_conexao"], dados["banco"])
    cursor.execute(sql, values)
    resultados = cursor.fetchall()
    for resultado in resultados:
        server = {'id': resultado[0], 'pacote': resultado[1],  'nome': resultado[2],}
        lista.append(server)

    cursor.close()
    db.close()

    return lista

def exclui_packets(dados):
    db = cria_conexao()
    cursor = db.cursor()
    sql = (
        '''UPDATE pacotes_enviados set deletado = 1 where id = %s  ''')
    values = (dados,)
    cursor.execute(sql, values)
    cursor.close()
    db.close()