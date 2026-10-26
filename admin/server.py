#!/usr/bin/env python3
"""
Servidor local do Painel Administrativo de Conectados na Verdade.
Roda em Python 3 puro sem dependências externas.
"""

import http.server
import socketserver
import json
import os
import sys
import shutil
import datetime
import urllib.parse
import webbrowser
import mimetypes

# Diretório raiz do projeto (um nível acima de admin/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADMIN_DIR = os.path.join(BASE_DIR, 'admin')
DATA_DIR = os.path.join(BASE_DIR, 'assets', 'data')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups')

PRIMARY_JSON = os.path.join(DATA_DIR, 'site-data.example.json')
PRODUCTION_JSON = os.path.join(DATA_DIR, 'site-data.json')

# Garantir existência de diretórios
os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'assets', 'img'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'assets', 'audio'), exist_ok=True)

def get_active_json_path():
    """Retorna o caminho do arquivo JSON principal existente."""
    if os.path.exists(PRIMARY_JSON):
        return PRIMARY_JSON
    if os.path.exists(PRODUCTION_JSON):
        return PRODUCTION_JSON
    return PRIMARY_JSON

def load_data():
    """Carrega os dados JSON do arquivo ativo."""
    path = get_active_json_path()
    if not os.path.exists(path):
        return {"erro": "Arquivo de dados não encontrado", "professores": [], "turmas": []}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_backup():
    """Cria uma cópia de segurança com timestamp."""
    source = get_active_json_path()
    if not os.path.exists(source):
        return None
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"site-data_backup_{timestamp}.json"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    shutil.copy2(source, backup_path)
    return backup_filename

def save_data(data):
    """Salva os dados nos arquivos JSON ativos e cria backup."""
    # Validação mínima
    if not isinstance(data, dict):
        raise ValueError("Os dados enviados devem ser um objeto JSON.")
    
    # 1. Cria backup prévio
    backup_file = create_backup()
    
    # 2. Atualiza data de atualização
    data['atualizadoEm'] = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # 3. Salva no arquivo primário
    with open(PRIMARY_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
        
    # 4. Mantém site-data.json sincronizado caso exista ou seja criado
    try:
        with open(PRODUCTION_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
    except Exception as e:
        print(f"Aviso ao sincronizar {PRODUCTION_JSON}: {e}")
        
    return {
        "sucesso": True,
        "atualizadoEm": data['atualizadoEm'],
        "backupCriado": backup_file,
        "mensagem": "Dados salvos com sucesso!"
    }

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP customizado com rotas de API para o CRUD."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Log mais limpo no terminal
        sys.stdout.write(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {format % args}\n")

    def send_json(self, data, status_code=200):
        """Envia resposta JSON com headers apropriados."""
        payload = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        """Responde requisições de pre-flight CORS se necessário."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Rotas da API
        if path == '/api/data':
            try:
                data = load_data()
                self.send_json(data)
            except Exception as e:
                self.send_json({"erro": str(e)}, status_code=500)
            return

        elif path == '/api/backups':
            try:
                backups = []
                if os.path.exists(BACKUP_DIR):
                    for fname in sorted(os.listdir(BACKUP_DIR), reverse=True):
                        if fname.endswith('.json'):
                            fpath = os.path.join(BACKUP_DIR, fname)
                            stat = os.stat(fpath)
                            backups.append({
                                "arquivo": fname,
                                "tamanho": stat.st_size,
                                "criadoEm": datetime.datetime.fromtimestamp(stat.st_mtime).strftime('%d/%m/%Y %H:%M:%S')
                            })
                self.send_json({"backups": backups})
            except Exception as e:
                self.send_json({"erro": str(e)}, status_code=500)
            return

        elif path == '/api/stats':
            try:
                data = load_data()
                stats = {
                    "professores": len(data.get("professores", [])),
                    "turmas": len(data.get("turmas", [])),
                    "depoimentos": len(data.get("depoimentos", [])),
                    "materias": len(data.get("materias", [])),
                    "ofertas": len(data.get("ofertas", [])),
                    "materiais": len(data.get("materiais", [])),
                    "atualizadoEm": data.get("atualizadoEm", "N/A"),
                }
                self.send_json(stats)
            except Exception as e:
                self.send_json({"erro": str(e)}, status_code=500)
            return

        # Rota inicial do admin: / ou /admin -> serve admin/index.html
        if path in ('/', '/admin', '/admin/'):
            index_path = os.path.join(ADMIN_DIR, 'index.html')
            self.serve_file(index_path, 'text/html; charset=utf-8')
            return

        # Rota de arquivos do admin (admin.css, admin.js, etc.)
        if path.startswith('/admin/'):
            rel_path = path[len('/admin/'):]
            target_path = os.path.join(ADMIN_DIR, rel_path)
            if os.path.exists(target_path) and os.path.isfile(target_path):
                mime, _ = mimetypes.guess_type(target_path)
                self.serve_file(target_path, mime or 'application/octet-stream')
                return

        # Rota normal de arquivos estáticos do site (assets, etc.)
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Ler corpo da requisição
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        if path == '/api/save':
            try:
                payload = json.loads(body.decode('utf-8'))
                res = save_data(payload)
                self.send_json(res)
            except Exception as e:
                self.send_json({"sucesso": False, "erro": str(e)}, status_code=500)
            return

        elif path == '/api/restore':
            try:
                payload = json.loads(body.decode('utf-8'))
                backup_filename = payload.get('arquivo')
                if not backup_filename:
                    self.send_json({"erro": "Nome do arquivo de backup não informado."}, status_code=400)
                    return

                backup_path = os.path.join(BACKUP_DIR, os.path.basename(backup_filename))
                if not os.path.exists(backup_path):
                    self.send_json({"erro": "Arquivo de backup não encontrado."}, status_code=404)
                    return

                # Cria backup de segurança do estado antes de restaurar
                pre_restore_backup = create_backup()

                # Carrega o arquivo do backup
                with open(backup_path, 'r', encoding='utf-8') as f:
                    restored_data = json.load(f)

                # Salva nos arquivos ativos
                with open(PRIMARY_JSON, 'w', encoding='utf-8') as f:
                    json.dump(restored_data, f, indent=2, ensure_ascii=False)
                    f.write('\n')

                if os.path.exists(PRODUCTION_JSON):
                    with open(PRODUCTION_JSON, 'w', encoding='utf-8') as f:
                        json.dump(restored_data, f, indent=2, ensure_ascii=False)
                        f.write('\n')

                self.send_json({
                    "sucesso": True,
                    "mensagem": f"Backup '{backup_filename}' restaurado com sucesso!",
                    "backupAnterior": pre_restore_backup,
                    "data": restored_data
                })
            except Exception as e:
                self.send_json({"sucesso": False, "erro": str(e)}, status_code=500)
            return

        elif path == '/api/upload':
            try:
                payload = json.loads(body.decode('utf-8'))
                # payload: { "tipo": "img" | "audio", "subpasta": "...", "nomeArquivo": "...", "conteudoBase64": "..." }
                import base64
                tipo = payload.get('tipo', 'img') # 'img' ou 'audio'
                nome_arquivo = payload.get('nomeArquivo')
                b64_data = payload.get('conteudoBase64')
                subpasta = payload.get('subpasta', '')

                if not nome_arquivo or not b64_data:
                    self.send_json({"erro": "Arquivo ou dados incompletos."}, status_code=400)
                    return

                # Remove cabeçalho data:image/png;base64, se houver
                if ',' in b64_data:
                    b64_data = b64_data.split(',', 1)[1]

                file_bytes = base64.b64decode(b64_data)

                # Sanitizar nome
                clean_name = os.path.basename(nome_arquivo).replace(' ', '_')
                target_folder = os.path.join(BASE_DIR, 'assets', tipo)
                if subpasta:
                    target_folder = os.path.join(target_folder, subpasta)
                os.makedirs(target_folder, exist_ok=True)

                file_dest = os.path.join(target_folder, clean_name)
                with open(file_dest, 'wb') as f:
                    f.write(file_bytes)

                rel_url = f"assets/{tipo}/" + (f"{subpasta}/" if subpasta else "") + clean_name

                self.send_json({
                    "sucesso": True,
                    "url": rel_url,
                    "mensagem": f"Arquivo salvo com sucesso em {rel_url}"
                })
            except Exception as e:
                self.send_json({"sucesso": False, "erro": str(e)}, status_code=500)
            return

        self.send_error(404, "Rota POST não encontrada")

    def serve_file(self, file_path, content_type):
        """Serve um arquivo local com o content-type informado."""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Erro ao ler arquivo: {e}")

def find_available_port(start_port=8080, max_attempts=20):
    """Encontra uma porta disponível a partir da porta inicial."""
    import socket
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    return start_port

def run_server():
    port = find_available_port(8080)
    server_address = ('127.0.0.1', port)

    # Permitir reuso rápido da porta
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, AdminHandler) as httpd:
        url = f"http://localhost:{port}/"
        print("=" * 60)
        print("  CONECTADOS NA VERDADE - PAINEL ADMINISTRATIVO LOCAL")
        print("=" * 60)
        print(f" Servidor iniciado com sucesso!")
        print(f" Endereço: {url}")
        print(f" Pasta de dados: {DATA_DIR}")
        print(f" Backups automáticos: {BACKUP_DIR}")
        print("-" * 60)
        print(" Pressione Ctrl+C para encerrar o servidor.")
        print("=" * 60)

        # Abrir navegador automaticamente
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrando servidor administrativo. Até logo!")

if __name__ == '__main__':
    run_server()
