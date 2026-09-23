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
      : "Use um link como professor-turma?turma=ING_11_SEG_A_QUI_MAR.";
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

      const subjectName = data.ofertas.find(o => o.id === turma.ofertaId)?.nome || "Matéria";
      document.title = `${subjectName} com ${professor.nome} | Conectados na Verdade`;

      content.replaceChildren();

      // Card da Matéria (Turma)
      const subjectCard = document.createElement("section");
      subjectCard.className = "subject-card";

      // Cabeçalho
      const header = document.createElement("header");
      header.className = "subject-heading";
      
      const kicker = document.createElement("div");
      kicker.className = "online-mark";
      kicker.setAttribute("aria-hidden", "true");
      kicker.textContent = "⌁";
      
      const title = document.createElement("h1");
      title.innerHTML = `${subjectName} <br><span class="subject-name" style="font-size: 0.6em; line-height: 1.2;">${professor.tratamento} ${professor.nome}</span>`;
      
      const meta = document.createElement("p");
      meta.className = "subject-meta";
      
      const diasNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const diasStr = turma.dias ? turma.dias.map(d => diasNomes[d]).join(", ") : "";
      
      meta.innerHTML = `<span><i>◷</i><b class="subject-hours">${turma.horaInicio} (${diasStr})</b></span>`;
      
      header.append(kicker, title, meta);
      subjectCard.append(header);

      // Menu de Ações
      const nav = document.createElement("nav");
      nav.className = "subject-actions";
      nav.setAttribute("aria-label", "Opções da turma");

      // 1. Conheça o professor
      nav.innerHTML += `
        <a class="subject-action" href="professor?professor=${professor.id}">
          <b class="subject-icon"><img src="assets/icons/teacher-1.png" alt="" /></b>
          <span>Conheça o(a) <em>professor(a)</em>;</span>
        </a>
      `;

      // 2. Detalhes da Turma
      nav.innerHTML += `
        <a class="subject-action" href="turma-detalhes?turma=${turma.id}">
          <b class="subject-icon"><img src="assets/icons/course-2.png" alt="" /></b>
          <span>Ver <em>detalhes e horários</em> da turma;</span>
        </a>
      `;

      // 3. Ouça a mensagem
      if (turma.audioEpecificoUrl) {
        nav.innerHTML += `
          <a class="subject-action" href="turma-mensagem?turma=${turma.id}">
            <b class="subject-icon"><img src="assets/icons/tutoring.png" alt="" /></b>
            <span>Ouça uma <em>mensagem</em> para a turma;</span>
          </a>
        `;
      }

      // 4. Aulas online (Vídeos gerais)
      nav.innerHTML += `
        <a class="subject-action" href="videos.html">
          <b class="subject-icon"><img src="assets/icons/video.png" alt="" /></b>
          <span>Veja um trecho das <em>aulas online</em>;</span>
        </a>
      `;

      // 5. Material Utilizado
      if (turma.materialId) {
        nav.innerHTML += `
          <a class="subject-action" href="material-em-fase-escolha.html?turma=${turma.id}">
            <b class="subject-icon"><img src="assets/icons/book.png" alt="" /></b>
            <span>Confira o <em>material</em> utilizado;</span>
          </a>
        `;
      }

      subjectCard.append(nav);
      content.append(subjectCard);
    })
    .catch((err) => {
      console.error(err);
      const message = window.location.protocol === "file:"
        ? "A leitura do JSON requer HTTP."
        : "Não foi possível carregar os dados agora.";
      showMessage("Página indisponível", message);
    });
})();
