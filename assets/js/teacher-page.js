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

      if (professor.audio?.url) {
        const description = document.createElement("p");
        description.textContent = professor.audio.descricao || "Ouça a apresentação.";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "metadata";
        audio.src = professor.audio.url;
        content.append(description, audio);
      }
    })
    .catch(() => {
      const message = window.location.protocol === "file:"
        ? "A leitura do JSON requer que o site seja aberto por HTTP, não diretamente por file://."
        : "Não foi possível carregar os dados do professor agora.";
      showMessage("Perfil indisponível", message);
    });
})();
