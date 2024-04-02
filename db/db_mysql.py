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
            cr.tipo
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
        server = {'name': resultado[0], 'address': resultado[1], 'protocolo': protocolo, 'tipo': tipo}
        servers.append(server)

    cursor.close()
    db.close()

    return servers

busca_ips()