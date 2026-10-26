/**
 * CONECTADOS NA VERDADE - PAINEL ADMINISTRATIVO (100% PURO JS / STANDALONE & API)
 * Funciona diretamente no navegador (sem necessidade de Python) e também com o servidor local.
 */

(() => {
  // Estado global da aplicação
  const state = {
    data: null,
    fileHandle: null,
    loadedFileName: 'site-data.example.json',
    hasUnsavedChanges: false,
    activeTab: 'dashboard',
    filterTurmas: { search: '', oferta: '', professor: '', status: '' },
    filterProfessores: { search: '', status: '' },
    filterDepoimentos: { search: '', professor: '', tipo: '' },
    editingTurmaIndex: null,
    editingProfIndex: null,
    editingDepoimentoIndex: null,
    editingMateriaIndex: null,
    editingOfertaIndex: null,
    editingMaterialIndex: null
  };

  // Nomes dos dias da semana (ISO: 1=Segunda, 7/0=Domingo)
  const DIAS_MAP = {
    1: 'Seg',
    2: 'Ter',
    3: 'Qua',
    4: 'Qui',
    5: 'Sex',
    6: 'Sáb',
    0: 'Dom',
    7: 'Dom'
  };

  // Utilitários de Formatação
  const utils = {
    formatMoney(cents) {
      if (cents == null || isNaN(cents)) return 'R$ 0,00';
      return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    parseMoney(str) {
      if (typeof str === 'number') return Math.round(str * 100);
      if (!str) return 0;
      const clean = str.toString().replace(/[R$\s.]/g, '').replace(',', '.');
      const val = parseFloat(clean);
      return isNaN(val) ? 0 : Math.round(val * 100);
    },

    formatDias(dias) {
      if (!dias || !dias.length) return 'A combinar';
      const sorted = [...dias].sort();
      if (sorted.length === 4 && sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3 && sorted[3] === 4) {
        return 'Seg a Qui';
      }
      return sorted.map(d => DIAS_MAP[d] || d).join(', ');
    },

    slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    },

    showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const icons = {
        success: '✓',
        danger: '✕',
        warning: '⚠'
      };

      toast.innerHTML = `
        <span style="font-weight: bold; font-size: 16px;">${icons[type] || 'ℹ'}</span>
        <span>${message}</span>
      `;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    markUnsaved() {
      state.hasUnsavedChanges = true;
      const unsavedBar = document.getElementById('unsaved-bar');
      if (unsavedBar) unsavedBar.classList.add('visible');
      const saveBtn = document.getElementById('btn-save-global');
      if (saveBtn) {
        saveBtn.classList.remove('btn-secondary');
        saveBtn.classList.add('btn-success');
      }
      // Auto-salva rascunho temporário no localStorage
      try {
        if (state.data) {
          localStorage.setItem('conectados_site_data_draft', JSON.stringify(state.data));
        }
      } catch (e) {}
    },

    markSaved() {
      state.hasUnsavedChanges = false;
      const unsavedBar = document.getElementById('unsaved-bar');
      if (unsavedBar) unsavedBar.classList.remove('visible');
      const saveBtn = document.getElementById('btn-save-global');
      if (saveBtn) {
        saveBtn.classList.remove('btn-success');
        saveBtn.classList.add('btn-secondary');
      }
      try {
        localStorage.removeItem('conectados_site_data_draft');
      } catch (e) {}
    }
  };

  // Senha padrão inicial: 'conectados2026' (hash SHA-256)
  const DEFAULT_PASSWORD_HASH = '094e49f9271ae260488daec0774f964dd23f4f31b090dcc8f213e07d561d6c1f';

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getStoredPasswordHash() {
    return localStorage.getItem('conectados_admin_pwd_hash') || DEFAULT_PASSWORD_HASH;
  }

  // Configuração da Tela de Bloqueio (Autenticação)
  function setupAuth() {
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-password');
    const lockToggle = document.getElementById('lock-toggle-pwd');
    const isAuthed = sessionStorage.getItem('conectados_auth_session') === 'true';

    if (lockScreen) {
      if (isAuthed) {
        lockScreen.classList.add('hidden');
      } else {
        lockScreen.classList.remove('hidden');
        if (lockInput) setTimeout(() => lockInput.focus(), 100);
      }
    }

    if (lockToggle && lockInput) {
      lockToggle.addEventListener('click', () => {
        if (lockInput.type === 'password') {
          lockInput.type = 'text';
          lockToggle.textContent = '🙈';
        } else {
          lockInput.type = 'password';
          lockToggle.textContent = '👁️';
        }
      });
    }
  }

  async function handleLogin() {
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-password');
    const lockError = document.getElementById('lock-error');
    const lockCard = document.querySelector('.lock-card');
    if (!lockInput) return;

    const typed = lockInput.value;
    const hash = await sha256(typed);

    if (hash === getStoredPasswordHash()) {
      sessionStorage.setItem('conectados_auth_session', 'true');
      if (lockError) lockError.classList.remove('visible');
      if (lockScreen) lockScreen.classList.add('hidden');
      lockInput.value = '';
      utils.showToast('Acesso autorizado! Bem-vindo(a).', 'success');
    } else {
      if (lockError) {
        lockError.textContent = 'Senha incorreta. Tente novamente.';
        lockError.classList.add('visible');
      }
      if (lockCard) {
        lockCard.classList.add('shake');
        setTimeout(() => lockCard.classList.remove('shake'), 450);
      }
      lockInput.select();
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('conectados_auth_session');
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-password');
    if (lockScreen) {
      lockScreen.classList.remove('hidden');
      if (lockInput) {
        lockInput.value = '';
        lockInput.focus();
      }
    }
    utils.showToast('Painel bloqueado com sucesso.', 'warning');
  }

  async function handleChangePassword() {
    const currentInput = document.getElementById('pwd-current');
    const newInput = document.getElementById('pwd-new');
    const confirmInput = document.getElementById('pwd-confirm');
    if (!currentInput || !newInput || !confirmInput) return;

    const currentVal = currentInput.value;
    const newVal = newInput.value;
    const confirmVal = confirmInput.value;

    const currentHash = await sha256(currentVal);
    if (currentHash !== getStoredPasswordHash()) {
      alert('A "Senha Atual" digitada está incorreta.');
      currentInput.focus();
      return;
    }

    if (!newVal || newVal.length < 4) {
      alert('A nova senha deve ter no mínimo 4 caracteres.');
      newInput.focus();
      return;
    }

    if (newVal !== confirmVal) {
      alert('A nova senha e a confirmação não coincidem.');
      confirmInput.focus();
      return;
    }

    const newHash = await sha256(newVal);
    localStorage.setItem('conectados_admin_pwd_hash', newHash);

    currentInput.value = '';
    newInput.value = '';
    confirmInput.value = '';

    utils.showToast('✅ Senha de acesso alterada com sucesso!', 'success');
  }

  function handleResetPassword() {
    if (confirm('Deseja realmente redefinir a senha de acesso para o padrão inicial ("conectados2026")?')) {
      localStorage.removeItem('conectados_admin_pwd_hash');
      const currentInput = document.getElementById('pwd-current');
      const newInput = document.getElementById('pwd-new');
      const confirmInput = document.getElementById('pwd-confirm');
      if (currentInput) currentInput.value = '';
      if (newInput) newInput.value = '';
      if (confirmInput) confirmInput.value = '';
      utils.showToast('Senha redefinida para a padrão: "conectados2026"', 'success');
    }
  }

  // Prevenir saída com alterações pendentes
  window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
    }
  });

  // Inicialização
  async function init() {
    setupAuth();
    setupNavigation();
    setupModals();
    setupGlobalActions();
    setupDragAndDrop();
    await loadInitialData();
  }

  // Carregamento inicial de dados
  async function loadInitialData() {
    // 1. Tenta carregar do servidor Python se estiver rodando
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        loadJsonData(json, 'site-data.example.json (Servidor Local)');
        return;
      }
    } catch (e) {}

    // 2. Tenta fazer fetch direto do caminho relativo do site
    try {
      const res = await fetch('assets/data/site-data.example.json');
      if (res.ok) {
        const json = await res.json();
        loadJsonData(json, 'assets/data/site-data.example.json');
        return;
      }
    } catch (e) {}

    // 3. Tenta verificar rascunho anterior no localStorage
    try {
      const saved = localStorage.getItem('conectados_site_data_draft') || localStorage.getItem('conectados_last_saved_data');
      if (saved) {
        const json = JSON.parse(saved);
        loadJsonData(json, 'Rascunho recuperado do navegador');
        utils.showToast('Rascunho anterior recuperado do seu navegador!', 'warning');
        return;
      }
    } catch (e) {}

    // 4. Se não carregou automaticamente (ex: file:// sem permissão de fetch), orienta o usuário
    updateFileStatusUI(null, 'Nenhum arquivo carregado ainda. Abra ou arraste o site-data.example.json');
  }

  function loadJsonData(json, fileName = 'site-data.example.json', handle = null) {
    if (!json || (!json.professores && !json.turmas)) {
      utils.showToast('Arquivo JSON inválido ou incompatível com o site.', 'danger');
      return;
    }

    state.data = json;
    state.loadedFileName = fileName;
    if (handle) state.fileHandle = handle;

    utils.markSaved();
    updateFileStatusUI(fileName);
    renderAll();
    utils.showToast(`Dados de "${fileName}" carregados com sucesso!`, 'success');

    // Guarda cópia de segurança no localStorage
    try {
      localStorage.setItem('conectados_last_saved_data', JSON.stringify(json));
    } catch (e) {}
  }

  function updateFileStatusUI(fileName, customMsg = null) {
    const label = document.getElementById('active-file-label');
    const badge = document.getElementById('active-file-badge');
    if (!label) return;

    if (fileName) {
      label.textContent = fileName;
      if (badge) {
        badge.className = 'status-badge active';
        badge.textContent = state.fileHandle ? 'Conectado direto ao arquivo (Disco)' : 'Carregado no Navegador';
      }
    } else {
      label.textContent = customMsg || 'Selecione o arquivo site-data.example.json';
      if (badge) {
        badge.className = 'status-badge inactive';
        badge.textContent = 'Aguardando arquivo';
      }
    }
  }

  // --- ARRASTAR E SOLTAR (DRAG & DROP) ---
  function setupDragAndDrop() {
    const overlay = document.getElementById('drag-overlay');

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (overlay) overlay.classList.add('active');
    });

    window.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null && overlay) {
        overlay.classList.remove('active');
      }
    });

    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (overlay) overlay.classList.remove('active');

      const items = e.dataTransfer.items;
      if (items && items[0]) {
        // Tenta obter o FileSystemHandle se suportado
        if ('getAsFileSystemHandle' in items[0]) {
          try {
            const handle = await items[0].getAsFileSystemHandle();
            if (handle && handle.kind === 'file') {
              const file = await handle.getFile();
              const text = await file.text();
              const json = JSON.parse(text);
              loadJsonData(json, file.name, handle);
              return;
            }
          } catch (err) {
            console.warn('Fallback para File padrão:', err);
          }
        }
      }

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            loadJsonData(json, file.name);
          } catch (err) {
            alert(`Falha ao ler o arquivo JSON: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // --- SELECIONAR ARQUIVO COM FILE PICKER NATIVO ---
  async function pickJsonFile() {
    // 1. Tenta API moderna File System Access (Chrome/Edge/Brave)
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Arquivos de Dados JSON',
            accept: { 'application/json': ['.json'] }
          }],
          multiple: false
        });
        const file = await handle.getFile();
        const text = await file.text();
        const json = JSON.parse(text);
        loadJsonData(json, file.name, handle);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // Usuário cancelou
        console.warn('showOpenFilePicker falhou, usando input clássico:', err);
      }
    }

    // 2. Fallback: clica no input file invisível
    const input = document.getElementById('input-open-json');
    if (input) input.click();
  }

  // --- GRAVAR ALTERAÇÕES (DIRETO NO ARQUIVO OU DOWNLOAD) ---
  async function saveAllData() {
    if (!state.data) {
      alert('Nenhum dado carregado para salvar. Abra o arquivo site-data.example.json primeiro.');
      return;
    }

    const saveBtn = document.getElementById('btn-save-global');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.innerHTML = '⏳ Salvando...';
      saveBtn.disabled = true;
    }

    try {
      // 1. Atualiza data
      state.data.atualizadoEm = new Date().toISOString().split('T')[0];
      const jsonString = JSON.stringify(state.data, null, 2) + '\n';

      // 2. Salva backup no navegador (localStorage)
      saveLocalBrowserBackup(state.data);

      let savedDirectly = false;

      // 3. Tenta salvar via servidor Python se estiver rodando
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.data)
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.sucesso) {
            savedDirectly = true;
          }
        }
      } catch (e) {}

      // 4. Se não salvou por servidor, tenta salvar via File System Access API direto no arquivo do disco
      if (!savedDirectly && state.fileHandle && 'createWritable' in state.fileHandle) {
        try {
          const writable = await state.fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          savedDirectly = true;
        } catch (err) {
          console.warn('createWritable falhou:', err);
        }
      }

      // 5. Se não tem servidor e nem permissão de FileSystem direta, dispara download do arquivo atualizado
      if (!savedDirectly) {
        downloadJsonFile(jsonString, state.loadedFileName || 'site-data.example.json');
        utils.showToast('📥 Arquivo atualizado baixado! Substitua-o na pasta assets/data/', 'success');
      } else {
        utils.showToast(`✅ Arquivo "${state.loadedFileName}" salvo diretamente no disco com sucesso!`, 'success');
      }

      utils.markSaved();
      updateCounters();
    } catch (err) {
      console.error(err);
      utils.showToast(`Erro ao salvar: ${err.message}`, 'danger');
    } finally {
      if (saveBtn) {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
      }
    }
  }

  function downloadJsonFile(content = null, fileName = 'site-data.example.json') {
    if (!state.data) return;
    const text = content || (JSON.stringify(state.data, null, 2) + '\n');
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function saveLocalBrowserBackup(data) {
    try {
      const backupsKey = 'conectados_backups_history';
      const history = JSON.parse(localStorage.getItem(backupsKey) || '[]');
      const now = new Date();
      const timeStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');

      history.unshift({
        id: 'backup_' + now.getTime(),
        timestamp: timeStr,
        fileName: state.loadedFileName,
        turmasCount: (data.turmas || []).length,
        profsCount: (data.professores || []).length,
        data: data
      });

      // Guarda os últimos 15 backups no navegador
      if (history.length > 15) history.pop();
      localStorage.setItem(backupsKey, JSON.stringify(history));
    } catch (e) {
      console.warn('Erro ao gravar backup no localStorage:', e);
    }
  }

  // --- RENDERIZAÇÃO GERAL ---
  function renderAll() {
    if (!state.data) return;

    updateCounters();

    switch (state.activeTab) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'turmas':
        renderTurmas();
        break;
      case 'professores':
        renderProfessores();
        break;
      case 'materias':
        renderMateriasEOfertas();
        break;
      case 'depoimentos':
        renderDepoimentos();
        break;
      case 'materiais':
        renderMateriais();
        break;
      case 'configuracao':
        renderConfiguracao();
        break;
      case 'backups':
        renderBackups();
        break;
    }
  }

  function updateCounters() {
    const data = state.data;
    if (!data) return;
    document.getElementById('badge-turmas').textContent = (data.turmas || []).length;
    document.getElementById('badge-professores').textContent = (data.professores || []).length;
    document.getElementById('badge-materias').textContent = (data.materias || []).length;
    document.getElementById('badge-depoimentos').textContent = (data.depoimentos || []).length;
    document.getElementById('badge-materiais').textContent = (data.materiais || []).length;
    
    const atualizadoEl = document.getElementById('topbar-atualizado');
    if (atualizadoEl && data.atualizadoEm) {
      const [ano, mes, dia] = data.atualizadoEm.split('-');
      atualizadoEl.textContent = `Atualizado em: ${dia}/${mes}/${ano}`;
    }
  }

  // Navegação de Abas
  function setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-nav');
        switchTab(tab);
      });
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`[data-nav="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const activeSec = document.getElementById(`view-${tabId}`);
    if (activeSec) activeSec.classList.add('active');

    const titles = {
      dashboard: 'Visão Geral',
      turmas: 'Gerenciamento de Turmas',
      professores: 'Corpo Docente (Professores)',
      materias: 'Matérias & Ofertas',
      depoimentos: 'Depoimentos de Famílias e Alunos',
      materiais: 'Materiais Didáticos',
      configuracao: 'Configurações do Site & PIX',
      backups: 'Histórico & Cópias de Segurança'
    };
    const titleEl = document.getElementById('topbar-view-title');
    if (titleEl) titleEl.textContent = titles[tabId] || 'Administração';

    renderAll();
  }

  // =========================================================================
  // ABA 1: DASHBOARD
  // =========================================================================
  function renderDashboard() {
    const data = state.data;
    if (!data) return;
    const turmasAtivas = (data.turmas || []).filter(t => t.ativo).length;
    const profsAtivos = (data.professores || []).filter(p => p.ativo).length;

    document.getElementById('stat-total-turmas').textContent = (data.turmas || []).length;
    document.getElementById('stat-turmas-ativas').textContent = `${turmasAtivas} ativas`;
    document.getElementById('stat-total-professores').textContent = (data.professores || []).length;
    document.getElementById('stat-profs-ativos').textContent = `${profsAtivos} ativos`;
    document.getElementById('stat-total-materias').textContent = (data.materias || []).length;
    document.getElementById('stat-total-depoimentos').textContent = (data.depoimentos || []).length;

    const summaryList = document.getElementById('dashboard-summary-list');
    if (summaryList) {
      summaryList.innerHTML = '';
      (data.professores || []).forEach(prof => {
        const count = (data.turmas || []).filter(t => t.professorId === prof.id).length;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '8px 0';
        row.style.borderBottom = '1px solid var(--border-subtle)';
        row.innerHTML = `
          <span><strong>${prof.tratamento} ${prof.nome}</strong></span>
          <span class="tag-badge">${count} turma(s)</span>
        `;
        summaryList.appendChild(row);
      });
    }
  }

  // =========================================================================
  // ABA 2: TURMAS
  // =========================================================================
  function renderTurmas() {
    const data = state.data;
    if (!data) return;
    const tbody = document.getElementById('turmas-table-body');
    if (!tbody) return;

    populateTurmaFilterSelects();

    const { search, oferta, professor, status } = state.filterTurmas;
    const searchLower = search.toLowerCase();

    const filtered = (data.turmas || []).map((t, idx) => ({ ...t, originalIndex: idx })).filter(t => {
      if (oferta && t.ofertaId !== oferta) return false;
      if (professor && t.professorId !== professor) return false;
      if (status === 'ativo' && !t.ativo) return false;
      if (status === 'inativo' && t.ativo) return false;
      if (search) {
        const prof = (data.professores || []).find(p => p.id === t.professorId);
        const profName = prof ? prof.nome.toLowerCase() : '';
        const nivel = t.publico?.nivel?.toLowerCase() || '';
        const id = t.id.toLowerCase();
        if (!profName.includes(searchLower) && !nivel.includes(searchLower) && !id.includes(searchLower)) {
          return false;
        }
      }
      return true;
    });

    document.getElementById('turmas-count-label').textContent = `${filtered.length} turma(s) listada(s)`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-dim);">Nenhuma turma encontrada com os filtros selecionados.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const prof = (data.professores || []).find(p => p.id === t.professorId);
      const profName = prof ? `${prof.tratamento} ${prof.nome}` : t.professorId;
      const of = (data.ofertas || []).find(o => o.id === t.ofertaId);
      const ofName = of ? of.nome : t.ofertaId;
      
      const preco = t.precoCentavos ?? data.precoCentavos;
      const precoStr = utils.formatMoney(preco);

      let publicoStr = t.publico?.nivel || 'Geral';
      if (t.publico?.idadeMin || t.publico?.idadeMax) {
        publicoStr += ` (${t.publico.idadeMin || 0} a ${t.publico.idadeMax || '+'} anos)`;
      } else if (t.publico?.rotulo) {
        publicoStr += ` (${t.publico.rotulo})`;
      }

      return `
        <tr>
          <td>
            <strong>${ofName}</strong><br>
            <span style="font-size: 11px; color: var(--text-dim); font-family: monospace;">${t.id}</span>
          </td>
          <td>${profName}</td>
          <td><span class="tag-badge">${publicoStr}</span></td>
          <td>
            <strong>${t.horaInicio}</strong> (${t.duracaoMinutos || 30} min)<br>
            <span style="font-size: 12px; color: var(--text-muted);">${utils.formatDias(t.dias)}</span>
          </td>
          <td><strong>${precoStr}</strong></td>
          <td>
            <span class="status-badge ${t.ativo ? 'active' : 'inactive'}">
              ${t.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </td>
          <td class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="app.editTurma(${t.originalIndex})" title="Editar turma">✏️ Editar</button>
            <button class="btn btn-secondary btn-sm" onclick="app.duplicateTurma(${t.originalIndex})" title="Duplicar esta turma">📑 Duplicar</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteTurma(${t.originalIndex})" title="Excluir turma">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function populateTurmaFilterSelects() {
    const selOferta = document.getElementById('filter-turma-oferta');
    const selProf = document.getElementById('filter-turma-professor');
    if (!selOferta || !selProf || !state.data) return;

    if (selOferta.children.length <= 1) {
      selOferta.innerHTML = '<option value="">Todas as ofertas</option>' + 
        (state.data.ofertas || []).map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
    }
    if (selProf.children.length <= 1) {
      selProf.innerHTML = '<option value="">Todos os professores</option>' + 
        (state.data.professores || []).map(p => `<option value="${p.id}">${p.tratamento} ${p.nome}</option>`).join('');
    }
  }

  // =========================================================================
  // ABA 3: PROFESSORES
  // =========================================================================
  function renderProfessores() {
    const data = state.data;
    if (!data) return;
    const container = document.getElementById('professores-grid');
    if (!container) return;

    const { search, status } = state.filterProfessores;
    const searchLower = search.toLowerCase();

    const filtered = (data.professores || []).map((p, idx) => ({ ...p, originalIndex: idx })).filter(p => {
      if (status === 'ativo' && !p.ativo) return false;
      if (status === 'inativo' && p.ativo) return false;
      if (search) {
        const full = `${p.tratamento} ${p.nome} ${p.id}`.toLowerCase();
        if (!full.includes(searchLower)) return false;
      }
      return true;
    });

    document.getElementById('profs-count-label').textContent = `${filtered.length} professor(es) listado(s)`;

    if (filtered.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">Nenhum professor encontrado com esses filtros.</p>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const turmasCount = (data.turmas || []).filter(t => t.professorId === p.id).length;
      const avatarHtml = p.fotoUrl 
        ? `<img class="teacher-avatar" src="${p.fotoUrl}" alt="${p.nome}" onerror="this.onerror=null; this.src='assets/icons/teacher-1.png';">`
        : `<div class="teacher-avatar-placeholder">${p.nome.charAt(0)}</div>`;

      const audioHtml = p.audio?.url ? `
        <div class="mini-player" style="margin-top: 8px;">
          <audio controls preload="none" src="${p.audio.url}"></audio>
        </div>
      ` : '';

      const bioSnippet = (p.biografia && p.biografia.length) ? p.biografia[0] : 'Sem biografia cadastrada.';

      return `
        <div class="teacher-card">
          <div class="teacher-card-top">
            ${avatarHtml}
            <div class="teacher-info">
              <span>${p.tratamento}</span>
              <h4>${p.nome}</h4>
              <span class="status-badge ${p.ativo ? 'active' : 'inactive'}" style="margin-top: 4px;">
                ${p.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <div class="teacher-body">
            <p class="teacher-bio-snippet">${bioSnippet}</p>
            ${p.versiculo ? `<div class="teacher-verse-box">📖 "${p.versiculo}"</div>` : ''}
            ${audioHtml}
            <div style="margin-top: 10px; font-size: 12px; color: var(--text-dim);">
              Turmas atreladas: <strong>${turmasCount}</strong>
            </div>
          </div>
          <div class="teacher-card-footer">
            <a href="professor.html?professor=${encodeURIComponent(p.id)}" target="_blank" class="btn btn-ghost btn-sm" title="Abrir perfil no site">👁️ Ver no Site</a>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="app.editProfessor(${p.originalIndex})">✏️ Editar</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteProfessor(${p.originalIndex})" title="Excluir professor">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // ABA 4: MATÉRIAS & OFERTAS
  // =========================================================================
  function renderMateriasEOfertas() {
    const data = state.data;
    if (!data) return;
    const matTbody = document.getElementById('materias-table-body');
    const ofTbody = document.getElementById('ofertas-table-body');

    if (matTbody) {
      matTbody.innerHTML = (data.materias || []).map((m, idx) => `
        <tr>
          <td><strong>${m.nome}</strong></td>
          <td><code>${m.id}</code></td>
          <td>${m.cargaSemanalMinutos ? m.cargaSemanalMinutos + ' min/sem' : '-'}</td>
          <td>${utils.formatMoney(m.precoCentavos)}</td>
          <td class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="app.editMateria(${idx})">✏️ Editar</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteMateria(${idx})">🗑️</button>
          </td>
        </tr>
      `).join('');
    }

    if (ofTbody) {
      ofTbody.innerHTML = (data.ofertas || []).map((o, idx) => {
        const mat = (data.materias || []).find(m => m.id === o.materiaId);
        return `
          <tr>
            <td><strong>${o.nome}</strong></td>
            <td><code>${o.id}</code></td>
            <td>${mat ? mat.nome : o.materiaId}</td>
            <td>
              <span class="status-badge ${o.ativo ? 'active' : 'inactive'}">
                ${o.ativo ? 'Ativa' : 'Inativa'}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn btn-secondary btn-sm" onclick="app.editOferta(${idx})">✏️ Editar</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteOferta(${idx})">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // ABA 5: DEPOIMENTOS
  // =========================================================================
  function renderDepoimentos() {
    const data = state.data;
    if (!data) return;
    const tbody = document.getElementById('depoimentos-table-body');
    if (!tbody) return;

    const selProf = document.getElementById('filter-depo-professor');
    if (selProf && selProf.children.length <= 1) {
      selProf.innerHTML = '<option value="">Todos os professores</option>' + 
        (data.professores || []).map(p => `<option value="${p.id}">${p.tratamento} ${p.nome}</option>`).join('');
    }

    const { search, professor, tipo } = state.filterDepoimentos;
    const searchLower = search.toLowerCase();

    const filtered = (data.depoimentos || []).map((d, idx) => ({ ...d, originalIndex: idx })).filter(d => {
      if (professor && d.professorId !== professor) return false;
      if (tipo && d.tipo !== tipo) return false;
      if (search) {
        const str = `${d.autor} ${d.estado} ${d.texto || ''} ${d.materia || ''}`.toLowerCase();
        if (!str.includes(searchLower)) return false;
      }
      return true;
    });

    document.getElementById('depo-count-label').textContent = `${filtered.length} depoimento(s) listado(s)`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-dim);">Nenhum depoimento encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(d => {
      const prof = (data.professores || []).find(p => p.id === d.professorId);
      const profName = prof ? `${prof.tratamento} ${prof.nome}` : (d.professorId || 'Geral');

      let conteudoHtml = '';
      if (d.tipo === 'audio') {
        conteudoHtml = `
          <div class="mini-player">
            <audio controls preload="none" src="${d.audioUrl}"></audio>
          </div>
          <span style="font-size:11px; color:var(--text-dim); font-family:monospace;">${d.audioUrl || ''}</span>
        `;
      } else {
        const preview = (d.texto && d.texto.length > 120) ? d.texto.substring(0, 120) + '…' : (d.texto || '');
        conteudoHtml = `<span style="font-style: italic; color: var(--text-main);">"${preview}"</span>`;
      }

      return `
        <tr>
          <td><strong>${d.autor}</strong> (${d.estado || 'BR'})<br><span style="font-size: 11px; color: var(--text-dim);">${d.autorDesc || ''}</span></td>
          <td>${profName}</td>
          <td><span class="tag-badge">${d.materia || 'Geral'}</span></td>
          <td>
            <span class="status-badge ${d.tipo === 'audio' ? 'active' : 'inactive'}">
              ${d.tipo === 'audio' ? '🎙️ Áudio' : '📝 Texto'}
            </span>
          </td>
          <td style="max-width: 320px;">${conteudoHtml}</td>
          <td class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="app.editDepoimento(${d.originalIndex})">✏️ Editar</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteDepoimento(${d.originalIndex})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // ABA 6: MATERIAIS DIDÁTICOS
  // =========================================================================
  function renderMateriais() {
    const data = state.data;
    if (!data) return;
    const tbody = document.getElementById('materiais-table-body');
    if (!tbody) return;

    tbody.innerHTML = (data.materiais || []).map((m, idx) => `
      <tr>
        <td><strong>${m.nome}</strong></td>
        <td><code>${m.id}</code></td>
        <td>${m.idadeMin || 0} a ${m.idadeMax || '+'} anos</td>
        <td><strong>${utils.formatMoney(m.precoCentavos)}</strong></td>
        <td>${m.maxParcelas ? m.maxParcelas + 'x' : 'À vista'}</td>
        <td>${m.frete ? '✅ Incluso / Sim' : '❌ Não'}</td>
        <td class="actions-cell">
          <button class="btn btn-secondary btn-sm" onclick="app.editMaterial(${idx})">✏️ Editar</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="app.deleteMaterial(${idx})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // ABA 7: CONFIGURAÇÕES & PIX
  // =========================================================================
  function renderConfiguracao() {
    const data = state.data;
    if (!data) return;
    const cfg = data.configuracao || {};
    const pix = cfg.pagamento?.pix || {};
    const tutoria = data.programas?.tutoria || {};
    const cursoPais = data.programas?.cursoPais || {};

    document.getElementById('cfg-ano-letivo').value = cfg.anoLetivo || 2026;
    document.getElementById('cfg-preco-global').value = (data.precoCentavos ? data.precoCentavos / 100 : 100).toFixed(2);
    document.getElementById('cfg-pix-chave').value = pix.chave || '';
    document.getElementById('cfg-pix-prazo').value = pix.prazoConfirmacaoHoras || 24;

    const selTutoria = document.getElementById('cfg-tutoria-resp');
    if (selTutoria) {
      selTutoria.innerHTML = (data.professores || []).map(p => 
        `<option value="${p.id}" ${tutoria.responsavelId === p.id ? 'selected' : ''}>${p.tratamento} ${p.nome}</option>`
      ).join('');
    }
    document.getElementById('cfg-tutoria-preco').value = (tutoria.precoCentavos ? tutoria.precoCentavos / 100 : 50).toFixed(2);
    document.getElementById('cfg-tutoria-hora-inicio').value = tutoria.horaInicio || '19:00';
    document.getElementById('cfg-tutoria-hora-fim').value = tutoria.horaFim || '20:00';
    document.getElementById('cfg-tutoria-plataforma').value = tutoria.plataforma || 'Google Meet';

    document.getElementById('cfg-curso-nome').value = cursoPais.nome || '';
    document.getElementById('cfg-curso-plataforma').value = cursoPais.plataforma || 'AECEP';
    document.getElementById('cfg-curso-preco').value = (cursoPais.precoCentavos ? cursoPais.precoCentavos / 100 : 300).toFixed(2);
    document.getElementById('cfg-curso-parcelas').value = cursoPais.maxParcelas || 12;
  }

  function saveConfiguracaoForm() {
    const data = state.data;
    if (!data) return;
    if (!data.configuracao) data.configuracao = {};
    if (!data.configuracao.pagamento) data.configuracao.pagamento = { pix: {} };
    if (!data.programas) data.programas = { tutoria: {}, cursoPais: {} };

    data.configuracao.anoLetivo = parseInt(document.getElementById('cfg-ano-letivo').value) || 2026;
    data.precoCentavos = utils.parseMoney(document.getElementById('cfg-preco-global').value);
    
    data.configuracao.pagamento.pix.chave = document.getElementById('cfg-pix-chave').value;
    data.configuracao.pagamento.pix.prazoConfirmacaoHoras = parseInt(document.getElementById('cfg-pix-prazo').value) || 24;

    data.programas.tutoria.responsavelId = document.getElementById('cfg-tutoria-resp').value;
    data.programas.tutoria.precoCentavos = utils.parseMoney(document.getElementById('cfg-tutoria-preco').value);
    data.programas.tutoria.horaInicio = document.getElementById('cfg-tutoria-hora-inicio').value;
    data.programas.tutoria.horaFim = document.getElementById('cfg-tutoria-hora-fim').value;
    data.programas.tutoria.plataforma = document.getElementById('cfg-tutoria-plataforma').value;

    data.programas.cursoPais.nome = document.getElementById('cfg-curso-nome').value;
    data.programas.cursoPais.plataforma = document.getElementById('cfg-curso-plataforma').value;
    data.programas.cursoPais.precoCentavos = utils.parseMoney(document.getElementById('cfg-curso-preco').value);
    data.programas.cursoPais.maxParcelas = parseInt(document.getElementById('cfg-curso-parcelas').value) || 12;

    utils.markUnsaved();
    utils.showToast('Configurações salvas no formulário! Clique em "Salvar Alterações" para gravar.', 'success');
  }

  // =========================================================================
  // ABA 8: HISTÓRICO & BACKUPS
  // =========================================================================
  async function renderBackups() {
    const container = document.getElementById('backups-list');
    if (!container) return;

    let items = [];

    // Tenta obter do servidor se estiver rodando
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const json = await res.json();
        if (json.backups && json.backups.length > 0) {
          items = json.backups.map(b => ({
            tipo: 'servidor',
            nome: b.arquivo,
            dataHora: b.criadoEm,
            detalhe: `${(b.tamanho / 1024).toFixed(1)} KB (na pasta backups)`
          }));
        }
      }
    } catch (e) {}

    // Sempre junta com os backups locais do navegador
    try {
      const localBackups = JSON.parse(localStorage.getItem('conectados_backups_history') || '[]');
      localBackups.forEach(lb => {
        items.push({
          tipo: 'local',
          id: lb.id,
          nome: `Backup Local (${lb.fileName})`,
          dataHora: lb.timestamp,
          detalhe: `${lb.turmasCount} turmas, ${lb.profsCount} professores`,
          data: lb.data
        });
      });
    } catch (e) {}

    if (items.length === 0) {
      container.innerHTML = '<p style="color:var(--text-dim); padding:20px; text-align:center;">Nenhum backup registrado ainda. Eles são criados automaticamente sempre que você clica em "Salvar Alterações".</p>';
      return;
    }

    container.innerHTML = items.map((b, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--border-subtle); background:white; border-radius:var(--radius-md); margin-bottom:8px;">
        <div>
          <strong>${b.nome}</strong><br>
          <span style="font-size:12px; color:var(--text-dim);">${b.dataHora} • ${b.detalhe}</span>
        </div>
        <div>
          ${b.tipo === 'servidor' 
            ? `<button class="btn btn-secondary btn-sm" onclick="app.restoreServerBackup('${b.nome}')">🔄 Restaurar do Disco</button>` 
            : `<button class="btn btn-secondary btn-sm" onclick="app.restoreLocalBackup(${idx})">🔄 Restaurar Rascunho</button>`
          }
        </div>
      </div>
    `).join('');

    // Armazena temporariamente para restauração
    window._cachedBackups = items;
  }

  // =========================================================================
  // MODAIS E FORMULÁRIOS DE EDIÇÃO (CRUD)
  // =========================================================================

  function setupModals() {
    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-backdrop').forEach(bd => {
      bd.addEventListener('click', (e) => {
        if (e.target === bd) closeAllModals();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    const bindFilter = (id, stateProp, filterProp) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          state[stateProp][filterProp] = e.target.value;
          renderAll();
        });
      }
    };

    bindFilter('search-turmas', 'filterTurmas', 'search');
    bindFilter('filter-turma-oferta', 'filterTurmas', 'oferta');
    bindFilter('filter-turma-professor', 'filterTurmas', 'professor');
    bindFilter('filter-turma-status', 'filterTurmas', 'status');

    bindFilter('search-professores', 'filterProfessores', 'search');
    bindFilter('filter-prof-status', 'filterProfessores', 'status');

    bindFilter('search-depoimentos', 'filterDepoimentos', 'search');
    bindFilter('filter-depo-professor', 'filterDepoimentos', 'professor');
    bindFilter('filter-depo-tipo', 'filterDepoimentos', 'tipo');

    document.getElementById('btn-save-config')?.addEventListener('click', saveConfiguracaoForm);
  }

  function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  function setupDaysPicker(containerId, initialDays = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const daysConfig = [
      { id: 1, label: 'Seg' },
      { id: 2, label: 'Ter' },
      { id: 3, label: 'Qua' },
      { id: 4, label: 'Qui' },
      { id: 5, label: 'Sex' },
      { id: 6, label: 'Sáb' },
      { id: 0, label: 'Dom' }
    ];

    container.innerHTML = daysConfig.map(d => `
      <div class="day-chip ${initialDays.includes(d.id) ? 'selected' : ''}" data-day="${d.id}">
        ${d.label}
      </div>
    `).join('');

    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });
  }

  function getSelectedDays(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const selected = [];
    container.querySelectorAll('.day-chip.selected').forEach(chip => {
      selected.push(parseInt(chip.getAttribute('data-day')));
    });
    return selected;
  }

  // --- TURMAS ---
  function openTurmaModal(index = null, duplicate = false) {
    if (!state.data) return;
    state.editingTurmaIndex = duplicate ? null : index;
    const isNew = index === null || duplicate;
    const turma = (!isNew && state.data.turmas[index]) 
      ? state.data.turmas[index] 
      : (duplicate && state.data.turmas[index] ? { ...state.data.turmas[index], id: state.data.turmas[index].id + '_COPIA' } : null);

    document.getElementById('modal-turma-title').textContent = isNew ? (duplicate ? 'Duplicar Turma' : 'Nova Turma') : 'Editar Turma';

    const selOferta = document.getElementById('turma-form-oferta');
    selOferta.innerHTML = (state.data.ofertas || []).map(o => `<option value="${o.id}">${o.nome}</option>`).join('');

    const selProf = document.getElementById('turma-form-professor');
    selProf.innerHTML = (state.data.professores || []).map(p => `<option value="${p.id}">${p.tratamento} ${p.nome}</option>`).join('');

    const selMat = document.getElementById('turma-form-material');
    selMat.innerHTML = '<option value="">Nenhum / Não especificado</option>' + 
      (state.data.materiais || []).map(m => `<option value="${m.id}">${m.nome}</option>`).join('');

    if (turma) {
      document.getElementById('turma-form-id').value = turma.id || '';
      selOferta.value = turma.ofertaId || (state.data.ofertas[0]?.id || '');
      selProf.value = turma.professorId || (state.data.professores[0]?.id || '');
      document.getElementById('turma-form-hora').value = turma.horaInicio || '10:00';
      document.getElementById('turma-form-duracao').value = turma.duracaoMinutos || 30;
      document.getElementById('turma-form-preco').value = (turma.precoCentavos ? turma.precoCentavos / 100 : (state.data.precoCentavos / 100)).toFixed(2);
      document.getElementById('turma-form-nivel').value = turma.publico?.nivel || 'iniciante';
      document.getElementById('turma-form-id-min').value = turma.publico?.idadeMin || '';
      document.getElementById('turma-form-id-max').value = turma.publico?.idadeMax || '';
      document.getElementById('turma-form-rotulo').value = turma.publico?.rotulo || '';
      document.getElementById('turma-form-audio').value = turma.audioEpecificoUrl || '';
      selMat.value = turma.materialId || '';
      document.getElementById('turma-form-ordem').value = turma.ordem || 10;
      document.getElementById('turma-form-ativo').checked = turma.ativo !== false;
      setupDaysPicker('turma-days-picker', turma.dias || [1, 2, 3, 4]);
    } else {
      document.getElementById('turma-form-id').value = '';
      selOferta.selectedIndex = 0;
      selProf.selectedIndex = 0;
      document.getElementById('turma-form-hora').value = '10:00';
      document.getElementById('turma-form-duracao').value = 30;
      document.getElementById('turma-form-preco').value = (state.data.precoCentavos / 100).toFixed(2);
      document.getElementById('turma-form-nivel').value = 'iniciante';
      document.getElementById('turma-form-id-min').value = '6';
      document.getElementById('turma-form-id-max').value = '8';
      document.getElementById('turma-form-rotulo').value = '';
      document.getElementById('turma-form-audio').value = '';
      selMat.value = '';
      document.getElementById('turma-form-ordem').value = ((state.data.turmas || []).length + 1) * 10;
      document.getElementById('turma-form-ativo').checked = true;
      setupDaysPicker('turma-days-picker', [1, 2, 3, 4]);
    }

    openModal('modal-turma');
  }

  function saveTurmaModal() {
    let id = document.getElementById('turma-form-id').value.trim();
    const ofertaId = document.getElementById('turma-form-oferta').value;
    const professorId = document.getElementById('turma-form-professor').value;
    const horaInicio = document.getElementById('turma-form-hora').value.trim();
    const duracaoMinutos = parseInt(document.getElementById('turma-form-duracao').value) || 30;
    const precoCentavos = utils.parseMoney(document.getElementById('turma-form-preco').value);
    const nivel = document.getElementById('turma-form-nivel').value.trim();
    const idadeMin = document.getElementById('turma-form-id-min').value ? parseInt(document.getElementById('turma-form-id-min').value) : null;
    const idadeMax = document.getElementById('turma-form-id-max').value ? parseInt(document.getElementById('turma-form-id-max').value) : null;
    const rotulo = document.getElementById('turma-form-rotulo').value.trim();
    const audioUrl = document.getElementById('turma-form-audio').value.trim();
    const materialId = document.getElementById('turma-form-material').value;
    const ordem = parseInt(document.getElementById('turma-form-ordem').value) || 10;
    const ativo = document.getElementById('turma-form-ativo').checked;
    const dias = getSelectedDays('turma-days-picker');

    if (!horaInicio) {
      alert('Informe o horário de início da turma.');
      return;
    }

    if (!id) {
      const horaClean = horaInicio.replace(':', '_');
      const profSlug = professorId.substring(0, 3).toUpperCase();
      id = `${ofertaId.toUpperCase().substring(0, 3)}_${horaClean}_${profSlug}`;
    }

    const publico = { nivel };
    if (idadeMin !== null) publico.idadeMin = idadeMin;
    if (idadeMax !== null) publico.idadeMax = idadeMax;
    if (rotulo) publico.rotulo = rotulo;

    const turmaObj = {
      id,
      ofertaId,
      publico,
      horaInicio,
      dias,
      duracaoMinutos,
      professorId,
      precoCentavos,
      ativo,
      ordem
    };

    if (audioUrl) turmaObj.audioEpecificoUrl = audioUrl;
    if (materialId) turmaObj.materialId = materialId;

    if (!state.data.turmas) state.data.turmas = [];

    if (state.editingTurmaIndex !== null) {
      state.data.turmas[state.editingTurmaIndex] = turmaObj;
      utils.showToast('Turma atualizada!', 'success');
    } else {
      state.data.turmas.push(turmaObj);
      utils.showToast('Nova turma adicionada!', 'success');
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  // --- PROFESSORES ---
  function openProfessorModal(index = null) {
    if (!state.data) return;
    state.editingProfIndex = index;
    const isNew = index === null;
    const prof = !isNew ? state.data.professores[index] : null;

    document.getElementById('modal-prof-title').textContent = isNew ? 'Novo Professor' : 'Editar Professor';

    if (prof) {
      document.getElementById('prof-form-id').value = prof.id || '';
      document.getElementById('prof-form-nome').value = prof.nome || '';
      document.getElementById('prof-form-tratamento').value = prof.tratamento || 'Teacher';
      document.getElementById('prof-form-foto').value = prof.fotoUrl || '';
      document.getElementById('prof-form-audio-url').value = prof.audio?.url || '';
      document.getElementById('prof-form-audio-desc').value = prof.audio?.descricao || '';
      document.getElementById('prof-form-bio').value = (prof.biografia || []).join('\n\n');
      document.getElementById('prof-form-versiculo').value = prof.versiculo || '';
      document.getElementById('prof-form-instagram').value = prof.instagram || '';
      document.getElementById('prof-form-ativo').checked = prof.ativo !== false;
    } else {
      document.getElementById('prof-form-id').value = '';
      document.getElementById('prof-form-nome').value = '';
      document.getElementById('prof-form-tratamento').value = 'Teacher';
      document.getElementById('prof-form-foto').value = '';
      document.getElementById('prof-form-audio-url').value = '';
      document.getElementById('prof-form-audio-desc').value = '';
      document.getElementById('prof-form-bio').value = '';
      document.getElementById('prof-form-versiculo').value = '';
      document.getElementById('prof-form-instagram').value = '';
      document.getElementById('prof-form-ativo').checked = true;
    }

    const nomeInput = document.getElementById('prof-form-nome');
    const idInput = document.getElementById('prof-form-id');
    nomeInput.oninput = () => {
      if (isNew) {
        idInput.value = utils.slugify(nomeInput.value);
      }
    };

    openModal('modal-professor');
  }

  function saveProfessorModal() {
    let id = document.getElementById('prof-form-id').value.trim();
    const nome = document.getElementById('prof-form-nome').value.trim();
    const tratamento = document.getElementById('prof-form-tratamento').value.trim();
    const fotoUrl = document.getElementById('prof-form-foto').value.trim();
    const audioUrl = document.getElementById('prof-form-audio-url').value.trim();
    const audioDesc = document.getElementById('prof-form-audio-desc').value.trim();
    const bioRaw = document.getElementById('prof-form-bio').value;
    const versiculo = document.getElementById('prof-form-versiculo').value.trim();
    const instagram = document.getElementById('prof-form-instagram').value.trim();
    const ativo = document.getElementById('prof-form-ativo').checked;

    if (!nome) {
      alert('Informe o nome do professor.');
      return;
    }

    if (!id) id = utils.slugify(nome);

    const biografia = bioRaw
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const profObj = {
      id,
      nome,
      tratamento: tratamento || 'Professor(a)',
      fotoUrl: fotoUrl || null,
      rota: `professor.html?professor=${encodeURIComponent(id)}`,
      biografia,
      ativo
    };

    if (versiculo) profObj.versiculo = versiculo;
    if (instagram) profObj.instagram = instagram;
    if (audioUrl) {
      profObj.audio = {
        url: audioUrl,
        descricao: audioDesc || `Conheça ${tratamento} ${nome} em sua própria voz.`
      };
    }

    if (!state.data.professores) state.data.professores = [];

    if (state.editingProfIndex !== null) {
      state.data.professores[state.editingProfIndex] = profObj;
      utils.showToast('Professor atualizado!', 'success');
    } else {
      state.data.professores.push(profObj);
      utils.showToast('Professor cadastrado!', 'success');
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  // --- DEPOIMENTOS ---
  function openDepoimentoModal(index = null) {
    if (!state.data) return;
    state.editingDepoimentoIndex = index;
    const isNew = index === null;
    const dep = !isNew ? state.data.depoimentos[index] : null;

    document.getElementById('modal-depo-title').textContent = isNew ? 'Novo Depoimento' : 'Editar Depoimento';

    const selProf = document.getElementById('depo-form-professor');
    selProf.innerHTML = '<option value="">Sem professor específico / Geral</option>' + 
      (state.data.professores || []).map(p => `<option value="${p.id}">${p.tratamento} ${p.nome}</option>`).join('');

    const tipoSelect = document.getElementById('depo-form-tipo');
    const boxTexto = document.getElementById('depo-box-texto');
    const boxAudio = document.getElementById('depo-box-audio');

    tipoSelect.onchange = () => {
      if (tipoSelect.value === 'audio') {
        boxTexto.style.display = 'none';
        boxAudio.style.display = 'flex';
      } else {
        boxTexto.style.display = 'flex';
        boxAudio.style.display = 'none';
      }
    };

    if (dep) {
      selProf.value = dep.professorId || '';
      document.getElementById('depo-form-materia').value = dep.materia || 'inglês';
      document.getElementById('depo-form-autor').value = dep.autor || '';
      document.getElementById('depo-form-autordesc').value = dep.autorDesc || '';
      document.getElementById('depo-form-estado').value = dep.estado || 'SP';
      tipoSelect.value = dep.tipo || 'texto';
      document.getElementById('depo-form-texto').value = dep.texto || '';
      document.getElementById('depo-form-audiourl').value = dep.audioUrl || '';
      document.getElementById('depo-form-audiotipo').value = dep.audioTipo || 'audio/ogg; codecs=opus';
    } else {
      selProf.selectedIndex = 0;
      document.getElementById('depo-form-materia').value = 'inglês';
      document.getElementById('depo-form-autor').value = '';
      document.getElementById('depo-form-autordesc').value = '';
      document.getElementById('depo-form-estado').value = 'SP';
      tipoSelect.value = 'texto';
      document.getElementById('depo-form-texto').value = '';
      document.getElementById('depo-form-audiourl').value = '';
      document.getElementById('depo-form-audiotipo').value = 'audio/ogg; codecs=opus';
    }

    tipoSelect.onchange();
    openModal('modal-depoimento');
  }

  function saveDepoimentoModal() {
    const professorId = document.getElementById('depo-form-professor').value || null;
    const materia = document.getElementById('depo-form-materia').value.trim() || 'geral';
    const autor = document.getElementById('depo-form-autor').value.trim();
    const autorDesc = document.getElementById('depo-form-autordesc').value.trim();
    const estado = document.getElementById('depo-form-estado').value.trim();
    const tipo = document.getElementById('depo-form-tipo').value;
    const texto = document.getElementById('depo-form-texto').value.trim();
    const audioUrl = document.getElementById('depo-form-audiourl').value.trim();
    const audioTipo = document.getElementById('depo-form-audiotipo').value.trim();

    if (!autor) {
      alert('Informe o nome do autor do depoimento.');
      return;
    }

    const depoObj = { tipo, autor, estado };
    if (professorId) depoObj.professorId = professorId;
    if (materia) depoObj.materia = materia;
    if (autorDesc) depoObj.autorDesc = autorDesc;

    if (tipo === 'audio') {
      if (!audioUrl) { alert('Informe a URL do arquivo de áudio.'); return; }
      depoObj.audioUrl = audioUrl;
      depoObj.audioTipo = audioTipo || 'audio/ogg; codecs=opus';
    } else {
      if (!texto) { alert('Informe o texto do depoimento.'); return; }
      depoObj.texto = texto;
    }

    if (!state.data.depoimentos) state.data.depoimentos = [];

    if (state.editingDepoimentoIndex !== null) {
      state.data.depoimentos[state.editingDepoimentoIndex] = depoObj;
      utils.showToast('Depoimento atualizado!', 'success');
    } else {
      state.data.depoimentos.push(depoObj);
      utils.showToast('Depoimento adicionado!', 'success');
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  // --- MATERIAIS ---
  function openMaterialModal(index = null) {
    if (!state.data) return;
    state.editingMaterialIndex = index;
    const isNew = index === null;
    const mat = !isNew ? state.data.materiais[index] : null;

    document.getElementById('modal-mat-title').textContent = isNew ? 'Novo Material' : 'Editar Material';

    if (mat) {
      document.getElementById('mat-form-id').value = mat.id || '';
      document.getElementById('mat-form-nome').value = mat.nome || '';
      document.getElementById('mat-form-id-min').value = mat.idadeMin || '';
      document.getElementById('mat-form-id-max').value = mat.idadeMax || '';
      document.getElementById('mat-form-preco').value = (mat.precoCentavos ? mat.precoCentavos / 100 : 0).toFixed(2);
      document.getElementById('mat-form-parcelas').value = mat.maxParcelas || 12;
      document.getElementById('mat-form-frete').checked = mat.frete !== false;
    } else {
      document.getElementById('mat-form-id').value = '';
      document.getElementById('mat-form-nome').value = '';
      document.getElementById('mat-form-id-min').value = '';
      document.getElementById('mat-form-id-max').value = '';
      document.getElementById('mat-form-preco').value = '0.00';
      document.getElementById('mat-form-parcelas').value = 12;
      document.getElementById('mat-form-frete').checked = true;
    }

    openModal('modal-material');
  }

  function saveMaterialModal() {
    let id = document.getElementById('mat-form-id').value.trim();
    const nome = document.getElementById('mat-form-nome').value.trim();
    const idadeMin = document.getElementById('mat-form-id-min').value ? parseInt(document.getElementById('mat-form-id-min').value) : null;
    const idadeMax = document.getElementById('mat-form-id-max').value ? parseInt(document.getElementById('mat-form-id-max').value) : null;
    const precoCentavos = utils.parseMoney(document.getElementById('mat-form-preco').value);
    const maxParcelas = parseInt(document.getElementById('mat-form-parcelas').value) || 12;
    const frete = document.getElementById('mat-form-frete').checked;

    if (!nome) { alert('Informe o nome do material didático.'); return; }
    if (!id) id = utils.slugify(nome);

    const matObj = { id, nome, precoCentavos, maxParcelas, frete };
    if (idadeMin !== null) matObj.idadeMin = idadeMin;
    if (idadeMax !== null) matObj.idadeMax = idadeMax;

    if (!state.data.materiais) state.data.materiais = [];

    if (state.editingMaterialIndex !== null) {
      state.data.materiais[state.editingMaterialIndex] = matObj;
      utils.showToast('Material atualizado!', 'success');
    } else {
      state.data.materiais.push(matObj);
      utils.showToast('Material cadastrado!', 'success');
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  // --- MATÉRIAS E OFERTAS ---
  function openMateriaModal(index = null) {
    if (!state.data) return;
    state.editingMateriaIndex = index;
    const isNew = index === null;
    const m = !isNew ? state.data.materias[index] : null;

    document.getElementById('modal-materia-title').textContent = isNew ? 'Nova Matéria' : 'Editar Matéria';
    if (m) {
      document.getElementById('materia-form-id').value = m.id || '';
      document.getElementById('materia-form-nome').value = m.nome || '';
      document.getElementById('materia-form-carga').value = m.cargaSemanalMinutos || 120;
      document.getElementById('materia-form-preco').value = (m.precoCentavos ? m.precoCentavos / 100 : (state.data.precoCentavos / 100)).toFixed(2);
    } else {
      document.getElementById('materia-form-id').value = '';
      document.getElementById('materia-form-nome').value = '';
      document.getElementById('materia-form-carga').value = 120;
      document.getElementById('materia-form-preco').value = (state.data.precoCentavos / 100).toFixed(2);
    }
    openModal('modal-materia');
  }

  function saveMateriaModal() {
    let id = document.getElementById('materia-form-id').value.trim();
    const nome = document.getElementById('materia-form-nome').value.trim();
    const cargaSemanalMinutos = parseInt(document.getElementById('materia-form-carga').value) || 120;
    const precoCentavos = utils.parseMoney(document.getElementById('materia-form-preco').value);

    if (!nome) { alert('Informe o nome da matéria.'); return; }
    if (!id) id = utils.slugify(nome);

    const mObj = {
      id,
      nome,
      cargaSemanalMinutos,
      precoCentavos,
      rota: `materia.html?materia=${encodeURIComponent(id)}`,
      ofertaIds: [id]
    };

    if (!state.data.materias) state.data.materias = [];

    if (state.editingMateriaIndex !== null) {
      state.data.materias[state.editingMateriaIndex] = mObj;
    } else {
      state.data.materias.push(mObj);
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  function openOfertaModal(index = null) {
    if (!state.data) return;
    state.editingOfertaIndex = index;
    const isNew = index === null;
    const o = !isNew ? state.data.ofertas[index] : null;

    document.getElementById('modal-oferta-title').textContent = isNew ? 'Nova Oferta' : 'Editar Oferta';
    const selMat = document.getElementById('oferta-form-materia');
    selMat.innerHTML = (state.data.materias || []).map(m => `<option value="${m.id}">${m.nome}</option>`).join('');

    if (o) {
      document.getElementById('oferta-form-id').value = o.id || '';
      document.getElementById('oferta-form-nome').value = o.nome || '';
      selMat.value = o.materiaId || (state.data.materias[0]?.id || '');
      document.getElementById('oferta-form-ativo').checked = o.ativo !== false;
    } else {
      document.getElementById('oferta-form-id').value = '';
      document.getElementById('oferta-form-nome').value = '';
      selMat.selectedIndex = 0;
      document.getElementById('oferta-form-ativo').checked = true;
    }
    openModal('modal-oferta');
  }

  function saveOfertaModal() {
    let id = document.getElementById('oferta-form-id').value.trim();
    const nome = document.getElementById('oferta-form-nome').value.trim();
    const materiaId = document.getElementById('oferta-form-materia').value;
    const ativo = document.getElementById('oferta-form-ativo').checked;

    if (!nome) { alert('Informe o nome da oferta.'); return; }
    if (!id) id = utils.slugify(nome);

    const oObj = {
      id,
      nome,
      materiaId,
      rota: `turmas/turmas-${encodeURIComponent(id)}.html`,
      ativo
    };

    if (!state.data.ofertas) state.data.ofertas = [];

    if (state.editingOfertaIndex !== null) {
      state.data.ofertas[state.editingOfertaIndex] = oObj;
    } else {
      state.data.ofertas.push(oObj);
    }

    utils.markUnsaved();
    closeAllModals();
    renderAll();
  }

  // --- CONFIGURAÇÃO DE AÇÕES GLOBAIS ---
  function setupGlobalActions() {
    document.getElementById('btn-save-global')?.addEventListener('click', saveAllData);
    document.getElementById('btn-save-unsaved-bar')?.addEventListener('click', saveAllData);

    document.getElementById('btn-pick-file')?.addEventListener('click', pickJsonFile);
    document.getElementById('btn-download-backup')?.addEventListener('click', () => downloadJsonFile());

    // Input file tradicional fallback
    const inputOpen = document.getElementById('input-open-json');
    if (inputOpen) {
      inputOpen.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            loadJsonData(json, file.name);
          } catch (err) {
            alert(`Falha ao ler o arquivo JSON: ${err.message}`);
          }
        };
        reader.readAsText(file);
      });
    }

    document.getElementById('btn-add-turma')?.addEventListener('click', () => openTurmaModal());
    document.getElementById('btn-add-professor')?.addEventListener('click', () => openProfessorModal());
    document.getElementById('btn-add-depoimento')?.addEventListener('click', () => openDepoimentoModal());
    document.getElementById('btn-add-materia')?.addEventListener('click', () => openMateriaModal());
    document.getElementById('btn-add-oferta')?.addEventListener('click', () => openOfertaModal());
    document.getElementById('btn-add-material')?.addEventListener('click', () => openMaterialModal());

    document.getElementById('btn-save-turma-modal')?.addEventListener('click', saveTurmaModal);
    document.getElementById('btn-save-prof-modal')?.addEventListener('click', saveProfessorModal);
    document.getElementById('btn-save-depo-modal')?.addEventListener('click', saveDepoimentoModal);
    document.getElementById('btn-save-material-modal')?.addEventListener('click', saveMaterialModal);
    document.getElementById('btn-save-materia-modal')?.addEventListener('click', saveMateriaModal);
    document.getElementById('btn-save-oferta-modal')?.addEventListener('click', saveOfertaModal);

    document.getElementById('btn-export-json')?.addEventListener('click', () => downloadJsonFile());

    const importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const imported = JSON.parse(reader.result);
            if (!imported.professores || !imported.turmas) {
              throw new Error('Arquivo JSON inválido.');
            }
            if (confirm('Carregar este arquivo JSON na tela? Suas alterações não salvas serão substituídas.')) {
              loadJsonData(imported, file.name);
            }
          } catch (err) {
            alert(`Falha ao ler arquivo: ${err.message}`);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // Funções expostas para chamadas inline (onclick="app...")
  window.app = {
    login: handleLogin,
    logout: handleLogout,
    changePassword: handleChangePassword,
    resetPassword: handleResetPassword,
    pickFile: pickJsonFile,
    saveData: saveAllData,
    downloadFile: downloadJsonFile,
    editTurma: (idx) => openTurmaModal(idx, false),
    duplicateTurma: (idx) => openTurmaModal(idx, true),
    deleteTurma: (idx) => {
      const t = state.data.turmas[idx];
      if (confirm(`Deseja realmente excluir a turma "${t.id}" (${t.horaInicio})?`)) {
        state.data.turmas.splice(idx, 1);
        utils.markUnsaved();
        utils.showToast('Turma excluída!', 'warning');
        renderAll();
      }
    },
    editProfessor: (idx) => openProfessorModal(idx),
    deleteProfessor: (idx) => {
      const p = state.data.professores[idx];
      const count = (state.data.turmas || []).filter(t => t.professorId === p.id).length;
      if (count > 0 && !confirm(`O professor "${p.nome}" tem ${count} turma(s) vinculada(s). Excluir mesmo assim?`)) return;
      if (count === 0 && !confirm(`Excluir o professor "${p.nome}"?`)) return;
      state.data.professores.splice(idx, 1);
      utils.markUnsaved();
      utils.showToast('Professor excluído!', 'warning');
      renderAll();
    },
    editDepoimento: (idx) => openDepoimentoModal(idx),
    deleteDepoimento: (idx) => {
      const d = state.data.depoimentos[idx];
      if (confirm(`Excluir depoimento de "${d.autor}"?`)) {
        state.data.depoimentos.splice(idx, 1);
        utils.markUnsaved();
        utils.showToast('Depoimento excluído!', 'warning');
        renderAll();
      }
    },
    editMateria: (idx) => openMateriaModal(idx),
    deleteMateria: (idx) => {
      const m = state.data.materias[idx];
      if (confirm(`Excluir a matéria "${m.nome}"?`)) {
        state.data.materias.splice(idx, 1);
        utils.markUnsaved();
        renderAll();
      }
    },
    editOferta: (idx) => openOfertaModal(idx),
    deleteOferta: (idx) => {
      const o = state.data.ofertas[idx];
      if (confirm(`Excluir a oferta "${o.nome}"?`)) {
        state.data.ofertas.splice(idx, 1);
        utils.markUnsaved();
        renderAll();
      }
    },
    editMaterial: (idx) => openMaterialModal(idx),
    deleteMaterial: (idx) => {
      const m = state.data.materiais[idx];
      if (confirm(`Excluir o material "${m.nome}"?`)) {
        state.data.materiais.splice(idx, 1);
        utils.markUnsaved();
        renderAll();
      }
    },
    restoreServerBackup: async (fn) => {
      if (!confirm(`Restaurar o backup "${fn}" do disco?`)) return;
      try {
        const res = await fetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arquivo: fn })
        });
        const json = await res.json();
        if (json.sucesso) {
          state.data = json.data;
          utils.markSaved();
          renderAll();
          utils.showToast(json.mensagem, 'success');
        }
      } catch (err) {
        alert('Erro ao restaurar: ' + err.message);
      }
    },
    restoreLocalBackup: (idx) => {
      const item = window._cachedBackups && window._cachedBackups[idx];
      if (!item || !item.data) return;
      if (confirm(`Deseja restaurar o rascunho de "${item.dataHora}"?`)) {
        state.data = item.data;
        utils.markUnsaved();
        renderAll();
        utils.showToast('Rascunho restaurado com sucesso!', 'success');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
