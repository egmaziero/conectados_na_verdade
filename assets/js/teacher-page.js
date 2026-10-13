(() => {
  const content = document.querySelector("[data-teacher-content]");
  const frame = document.querySelector("[data-teacher-frame]");
  const topbar = document.querySelector("[data-teacher-topbar]");
  const professorId = new URLSearchParams(window.location.search).get("professor");

  const showMessage = (title, message) => {
    document.title = `${title} | Conectados na Verdade`;
    content.replaceChildren();
    const heading = document.createElement("h1");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    content.append(heading, paragraph);
  };

  if (!professorId) {
    const message = window.location.protocol === "file:"
      ? "A prévia por arquivo local não preserva o parâmetro nesta visualização. Abra o site por HTTP e use professor.html?professor=karine-guillem."
      : "Use um link como professor.html?professor=karine-guillem.";
    showMessage("Professor não informado", message);
    return;
  }

  fetch("assets/data/site-data.example.json")
    .then((response) => {
      if (!response.ok) throw new Error("Falha ao carregar os perfis.");
      return response.json();
    })
    .then((data) => {
      const professor = data.professores.find((item) => item.id === professorId && item.ativo);
      if (!professor) {
        showMessage("Professor não encontrado", "Confira o endereço usado para abrir este perfil.");
        return;
      }

      document.title = `${professor.tratamento} ${professor.nome} | Conectados na Verdade`;
      topbar.textContent = "Voltar";
      if (professor.fotoUrl) frame.style.backgroundImage = `url("${encodeURI(professor.fotoUrl)}")`;

      content.replaceChildren();
      const kicker = document.createElement("p");
      kicker.className = "kicker";
      kicker.textContent = professor.tratamento;
      const heading = document.createElement("h1");
      heading.textContent = professor.nome;
      content.append(kicker, heading);

      (professor.biografia || []).forEach((texto) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = texto;
        content.append(paragraph);
      });

      if (professor.versiculo) {
        const verse = document.createElement("p");
        verse.className = "teacher-verse";
        verse.textContent = professor.versiculo;
        content.append(verse);
      }

      if (professor.audio && professor.audio.url) {
        const audioBox = document.createElement("div");
        audioBox.className = "teacher-audio-box";
        audioBox.style.marginTop = "16px";
        audioBox.style.padding = "10px 14px";
        audioBox.style.background = "rgba(255, 255, 255, 0.75)";
        audioBox.style.borderRadius = "12px";
        audioBox.style.border = "1px solid rgba(223, 207, 188, 0.6)";

        const audioTitle = document.createElement("p");
        audioTitle.style.fontWeight = "bold";
        audioTitle.style.fontSize = "14px";
        audioTitle.style.marginBottom = "8px";
        audioTitle.style.color = "#4a3424";
        audioTitle.textContent = "🎙️ Ouça a apresentação:";

        const audioEl = document.createElement("audio");
        audioEl.controls = true;
        audioEl.preload = "metadata";
        audioEl.src = professor.audio.url;
        audioEl.style.width = "100%";
        audioEl.style.display = "block";

        audioBox.append(audioTitle, audioEl);
        content.append(audioBox);
      }
    })
    .catch(() => {
      const message = window.location.protocol === "file:"
        ? "A leitura do JSON requer que o site seja aberto por HTTP, não diretamente por file://."
        : "Não foi possível carregar os dados do professor agora.";
      showMessage("Perfil indisponível", message);
    });
})();
