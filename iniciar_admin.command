#!/usr/bin/env bash
# Script para iniciar o Painel Administrativo de Conectados na Verdade
# Pode ser aberto com duplo-clique no Finder do macOS.

cd "$(dirname "$0")" || exit 1

echo "======================================================="
echo "   CONECTADOS NA VERDADE - PAINEL ADMINISTRATIVO"
echo "======================================================="
echo "Iniciando servidor local e abrindo o navegador..."
echo ""

python3 admin/server.py
