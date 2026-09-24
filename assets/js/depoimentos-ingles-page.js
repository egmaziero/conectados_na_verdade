(() => {
  const DATA_URL = "../assets/data/site-data.example.json";

  const professorId = new URLSearchParams(window.location.search).get("professor");
  const list = document.querySelector("[data-testimonials-list]");
  const title = document.querySelector("[data-testimonials-title]");

  const renderCard = (dep, professorNome) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";

    const icon = document.createElement("div");
    icon.className = "testimonial-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\u201c";

    const label = document.createElement("p");
    label.className = "testimonial-label";
    label.innerHTML = `Depoimento de <b>${dep.materia}</b> com a professora <b>${professorNome}</b>`;

    const quote = document.createElement("blockquote");

    if (dep.tipo === "audio") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      const source = document.createElement("source");
      source.src = `../${dep.audioUrl}`;
      source.type = dep.audioTipo;
      audio.append(source, "Seu navegador não suporta a reprodução de áudio.");
      const p = document.createElement("p");
      p.append(audio);
      quote.append(p);
    } else if (dep.tipo === "texto") {
      // Cada parágrafo separado por \n\n vira um <p> próprio
      const paragrafos = dep.texto.split(/\n\n+/);
      paragrafos.forEach((paragrafo) => {
        const p = document.createElement("p");
        p.textContent = paragrafo.trim();
        quote.append(p);
      });
    }

    const footer = document.createElement("footer");
    const footerLabel = dep.autorDesc
      ? `${dep.autor} <span>(${dep.autorDesc}), ${dep.estado}</span>`
      : `${dep.autor} <span>${dep.estado}</span>`;
    footer.innerHTML = footerLabel;

    card.append(icon, label, quote, footer);
    return card;
  };

  fetch(DATA_URL)
    .then((r) => {
      if (!r.ok) throw new Error("Falha ao carregar os dados.");
      return r.json();
    })
    .then((data) => {
      const depoimentos = data.depoimentos ?? [];
      const visíveis = professorId
        ? depoimentos.filter((d) => d.professorId === professorId)
        : depoimentos;

      if (professorId && visíveis.length) {
        const professor = data.professores.find((p) => p.id === professorId);
        const nomeProf = professor ? `${professor.tratamento} ${professor.nome}` : professorId;
        title.textContent = `O que as famílias testemunham sobre as aulas da ${nomeProf}`;
      }

      if (!visíveis.length) {
        const message = document.createElement("p");
        message.className = "mini";
        message.textContent = "Ainda não há depoimentos para esta professora.";
        list.append(message);
        return;
      }

      visíveis.forEach((dep) => {
        const professor = data.professores.find((p) => p.id === dep.professorId);
        const nomeProf = professor ? professor.nome : dep.professorId;
        list.append(renderCard(dep, nomeProf));
      });
    })
    .catch((err) => {
      console.error(err);
      const message = document.createElement("p");
      message.className = "mini";
      message.textContent =
        window.location.protocol === "file:"
          ? "A leitura do JSON requer HTTP."
          : "Não foi possível carregar os depoimentos agora.";
      list.append(message);
    });
})();
