#!/usr/bin/env bash
# Iniciar painel administrativo via terminal
cd "$(dirname "$0")" || exit 1
python3 admin/server.py
