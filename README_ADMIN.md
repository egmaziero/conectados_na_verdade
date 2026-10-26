# Painel Administrativo — Conectados na Verdade

Este aplicativo web local foi desenvolvido para permitir que qualquer pessoa gerencie e atualize todas as informações do site **Conectados na Verdade** de forma visual, simples e segura.

---

## 🔒 Proteção por Senha

O painel conta com uma tela de bloqueio por senha:
- **Senha Inicial Padrão:** `conectados2026`
- **Sessão Segura:** Ao fechar a aba ou navegador, o painel é bloqueado automaticamente.
- **Bloqueio Manual:** Você pode clicar em **"🔒 Bloquear / Sair"** no menu lateral a qualquer momento.
- **Como Alterar a Senha:** Na aba **⚙️ Configurações & PIX**, há o bloco **"Segurança & Senha de Acesso"** onde você pode definir uma nova senha ou redefinir para a padrão.

---

## ⚡ Como Rodar SEM Python (100% no Navegador)

Você não precisa abrir o terminal e nem de Python instalado!

1. Vá até a pasta do projeto no **Finder**.
2. Dê um **duplo clique** no arquivo:
   ```text
   admin.html
   ```
   *(Ele abrirá diretamente no Google Chrome, Safari, Edge ou Firefox)*.
3. Digite a senha: `conectados2026`.
4. No topo da tela, clique em **"📂 Abrir Arquivo JSON"** e selecione o arquivo:
   ```text
   assets/data/site-data.example.json
   ```
   *(Você também pode simplesmente **arrastar e soltar** o arquivo `site-data.example.json` direto para dentro da janela do navegador!)*
5. Faça as edições desejadas (turmas, professores, matérias, depoimentos, preços, etc.).
6. Clique em **"💾 Salvar Alterações"**:
   - No Google Chrome ou Microsoft Edge: o navegador **grava diretamente no arquivo do seu computador**.
   - Em outros navegadores: ele baixa o arquivo atualizado pronto para você substituir na pasta `assets/data/`.

---

## 🖥️ Opção Alternativa: Rodar com Servidor Local (Python)

Se você preferir rodar com um servidor local que abre a porta `8080`:

- **Duplo-clique no Finder:** [`iniciar_admin.command`](file:///Users/erickmaziero/Documents/conectados_na_verdade/iniciar_admin.command)
- **Ou via Terminal:** `./iniciar_admin.sh`

---

## 🧭 O Que Você Pode Fazer no Painel

- **🎓 Turmas**: Criar, editar, filtrar e duplicar turmas com horários, dias da semana (**Seg a Dom**) e preços em Reais (R$).
- **👩‍🏫 Professores**: Cadastrar nomes, fotos, áudios de apresentação, biografias e versículos.
- **📚 Matérias & Ofertas**: Gerenciar matérias escolares e turmas ofertadas.
- **💬 Depoimentos**: Gerenciar depoimentos de pais e alunos em formato texto ou áudio gravado.
- **📦 Materiais**: Gerenciar kits didáticos, valores e parcelamentos.
- **⚙️ Configurações & PIX**: Alterar o ano letivo, a chave PIX, programas especiais e a **senha de acesso**.
- **💾 Histórico & Backups**: O navegador salva cópias automáticas a cada alteração para você nunca perder seus dados.
