(() => {
  const content = document.querySelector("[data-teacher-content]");
  const turmaId = new URLSearchParams(window.location.search).get("turma");

  const showMessage = (title, message) => {
    document.title = `${title} | Conectados na Verdade`;
    content.replaceChildren();
    const heading = document.createElement("h1");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    content.append(heading, paragraph);
  };

  if (!turmaId) {
    const message = window.location.protocol === "file:"
      ? "A prévia por arquivo local não preserva o parâmetro. Abra por HTTP."
      : "Use um link como professor-turma.html?turma=ING_11_SEG_A_QUI_MAR.";
    showMessage("Turma não informada", message);
    return;
  }

  fetch("assets/data/site-data.example.json")
    .then((response) => {
      if (!response.ok) throw new Error("Falha ao carregar os dados.");
      return response.json();
    })
    .then((data) => {
      const turma = data.turmas.find((item) => item.id === turmaId && item.ativo);
      if (!turma) {
        showMessage("Turma não encontrada", "Confira o endereço usado para abrir esta página.");
        return;
      }

      const professor = data.professores.find((item) => item.id === turma.professorId && item.ativo);
      if (!professor) {
        showMessage("Professor não encontrado", "Dados do professor indisponíveis.");
        return;
      }

      const topbar = document.querySelector(".topbar-title strong");
      if (topbar) topbar.textContent = "Voltar";

      const oferta = data.ofertas.find(o => o.id === turma.ofertaId);
      const subjectName = oferta?.nome || "Matéria";
      document.title = `${subjectName} com ${professor.nome} | Conectados na Verdade`;

      content.replaceChildren();

      // Card da Matéria (Turma)
      const subjectCard = document.createElement("section");
      subjectCard.className = "subject-card";

      // Cabeçalho
      const header = document.createElement("header");
      header.className = "subject-heading";
      
      const kicker = document.createElement("img");
      kicker.className = "online-mark";
      kicker.src = "assets/img/logo_conectados.png";
      kicker.alt = "";
      
      const title = document.createElement("h1");
      const tratamento = (turma.ofertaId !== "ingles" && professor.tratamento === "Teacher")
        ? "Professora"
        : professor.tratamento;
      title.innerHTML = `${subjectName} <br><span class="subject-name" style="font-size: 0.6em; line-height: 1.2;">${tratamento} ${professor.nome}</span>`;
      
      const meta = document.createElement("p");
      meta.className = "subject-meta";
      
      const diasNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const diasStr = turma.dias ? turma.dias.map(d => diasNomes[d]).join(", ") : "";

      const precoCentavos = turma.precoCentavos ?? data.precoCentavos;
      const precoFormatado = precoCentavos != null
        ? (precoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : null;
      
      meta.innerHTML = `<span><i>◷</i><b class="subject-hours">${turma.horaInicio} (${diasStr})</b></span>`
        + (precoFormatado ? `<span><i>◉</i><b class="subject-price">${precoFormatado}</b></span>` : "");
      
      header.append(kicker, title, meta);
      subjectCard.append(header);

      // Menu de Ações
      const nav = document.createElement("nav");
      nav.className = "subject-actions";
      nav.setAttribute("aria-label", "Opções da turma");

      // 1. Conheça o professor
      if (professor.id !== "a-definir") {
        nav.innerHTML += `
          <a class="subject-action" href="professor.html?professor=${encodeURIComponent(professor.id)}">
            <b class="subject-icon"><img src="assets/icons/teacher-1.png" alt="" /></b>
            <span>Conheça o(a) <em>professor(a)</em></span>
          </a>
        `;
      }

      // 2. Depoimentos
      if (professor.id !== "a-definir") {
        const depoHref = turma.ofertaId === "tutoria"
          ? "depoimentos/depoimentos-tutoria.html"
          : `depoimentos/depoimentos-ingles.html?professor=${encodeURIComponent(professor.id)}&materia=${encodeURIComponent(turma.ofertaId)}`;
        nav.innerHTML += `
          <a class="subject-action" href="${depoHref}">
            <b class="subject-icon"><img src="assets/icons/heart.png" alt="" /></b>
            <span><em>Depoimentos</em> das famílias</span>
          </a>
        `;
      }

      // 3. Escute um áudio deste professor (sempre visível)
      nav.innerHTML += `
        <a class="subject-action" href="turma-mensagem.html?turma=${encodeURIComponent(turma.id)}">
          <b class="subject-icon"><img src="assets/icons/tutoring.png" alt="" /></b>
          <span>Escute um <em>áudio</em> deste professor</span>
        </a>
      `;

      // 4. Aulas online (Vídeos desabilitados temporariamente - Moodle em breve)
      nav.innerHTML += `
        <a class="subject-action is-disabled" href="javascript:void(0)" style="opacity: 0.55; cursor: default; pointer-events: none;">
          <b class="subject-icon"><img src="assets/icons/video.png" alt="" /></b>
          <span>Veja um trecho das <em>aulas online</em> <em style="font-weight: normal; opacity: 0.85;">(em breve)</em></span>
        </a>
      `;

      // 5. Grade de Horários (para matérias básicas) ou Material Utilizado (demais matérias)
      const basicSubjects = ["ciencias", "historia", "geografia", "matematica", "portugues"];
      const scheduleByLevel = {
        "1º ano": "horarios-1-ano.html",
        "3º ano": "horarios-3-ano.html",
        "5º ano": "horarios-5-ano.html",
        "7º ano": "horarios-7-ano.html",
        "9º ano": "horarios-9-ano.html"
      };

      if (basicSubjects.includes(turma.ofertaId)) {
        const nivel = turma.publico?.nivel || "";
        const scheduleHref = scheduleByLevel[nivel];
        if (scheduleHref) {
          nav.innerHTML += `
            <a class="subject-action" href="${scheduleHref}">
              <b class="subject-icon"><img src="assets/icons/calendar.png" alt="" /></b>
              <span>Grade de <em>horários</em> (${nivel})</span>
            </a>
          `;
        }
      } else {
        const hasMaterial = Boolean(turma.materialUrl);
        const materialHref = turma.materialUrl || `material-em-fase-escolha.html?turma=${encodeURIComponent(turma.id)}`;
        nav.innerHTML += `
          <a class="subject-action" href="${materialHref}" ${hasMaterial ? 'target="_blank" rel="noopener"' : ''}>
            <b class="subject-icon"><img src="assets/icons/book.png" alt="" /></b>
            <span>Confira o <em>material</em> utilizado</span>
          </a>
        `;
      }

      // 6. Conheça os planos de valores
      nav.innerHTML += `
        <a class="subject-action" href="javascript:void(0)" id="btn-planos-valores">
          <b class="subject-icon"><img src="assets/icons/badge.png" alt="" /></b>
          <span>Conheça os <em>planos de valores</em></span>
        </a>
      `;

      // 7. Matrícula das aulas online
      nav.innerHTML += `
        <a class="subject-action subject-schedule" href="matriculas-online.html?turma=${encodeURIComponent(turma.id)}">
          <b class="subject-icon"><img src="assets/icons/cart-round.png" alt="" /></b>
          <span>Matrícula das <em>aulas online</em></span>
        </a>
      `;

      subjectCard.append(nav);
      content.append(subjectCard);

      const btnPlanos = document.getElementById("btn-planos-valores");
      const modalPlanos = document.getElementById("modal-planos");
      if (btnPlanos && modalPlanos) {
        btnPlanos.addEventListener("click", () => { modalPlanos.style.display = "flex"; });
        modalPlanos.querySelectorAll(".modal-close, .modal-backdrop").forEach(el => {
          el.addEventListener("click", () => { modalPlanos.style.display = "none"; });
        });
      }
    })
    .catch((err) => {
      console.error(err);
      const message = window.location.protocol === "file:"
        ? "A leitura do JSON requer HTTP."
        : "Não foi possível carregar os dados agora.";
      showMessage("Página indisponível", message);
    });
})();
