(() => {
  const DATA_URL = "../assets/data/site-data.example.json";

  const professorId = new URLSearchParams(window.location.search).get("professor");
  const materiaParam = new URLSearchParams(window.location.search).get("materia");
  const list = document.querySelector("[data-testimonials-list]");
  const title = document.querySelector("[data-testimonials-title]");

  const normalizeStr = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\b(e|a|de|da|do)\b/g, "")
      .replace(/[^a-z0-9]/g, "");

  const renderCard = (dep, professorNome) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";

    const icon = document.createElement("div");
    icon.className = "testimonial-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\u201c";

    const label = document.createElement("p");
    label.className = "testimonial-label";
    const materiaNome = dep.materia ? (dep.materia.charAt(0).toUpperCase() + dep.materia.slice(1)) : "Aulas";
    label.innerHTML = `Depoimento de <b>${materiaNome}</b> com <b>${professorNome}</b>`;

    const quote = document.createElement("blockquote");

    if (dep.tipo === "audio") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      const source = document.createElement("source");
      source.src = `../${dep.audioUrl}`;
      source.type = dep.audioTipo || "audio/ogg";
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
      const visíveis = depoimentos.filter((d) => {
        if (professorId && d.professorId !== professorId) return false;
        if (materiaParam && d.materia && d.materia !== "geral") {
          if (normalizeStr(d.materia) !== normalizeStr(materiaParam)) return false;
        }
        return true;
      });

      if (professorId && visíveis.length) {
        const professor = data.professores.find((p) => p.id === professorId);
        const nomeProf = professor ? `${professor.tratamento} ${professor.nome}` : professorId;
        if (materiaParam) {
          const labels = {
            "quimica-fisica": "Introdução à Química e Física",
            "aprendendo-palavra": "Aprendendo a Palavra",
            "hebraico": "Hebraico",
            "espanhol": "Espanhol",
            "musica": "Música",
            "ingles": "Inglês",
            "matematica": "Matemática",
            "portugues": "Português",
            "ciencias": "Ciências",
            "historia": "História",
            "geografia": "Geografia"
          };
          const matLabel = labels[materiaParam] || (materiaParam.charAt(0).toUpperCase() + materiaParam.slice(1));
          title.textContent = `O que as famílias testemunham sobre as aulas de ${matLabel} com ${nomeProf}`;
        } else {
          title.textContent = `O que as famílias testemunham sobre as aulas de ${nomeProf}`;
        }
      }

      if (!visíveis.length) {
        const message = document.createElement("p");
        message.className = "mini";
        message.textContent = "Ainda não há depoimentos cadastrados para esta turma.";
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
