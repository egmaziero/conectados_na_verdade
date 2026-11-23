(() => {
  const content = document.querySelector("[data-teacher-content]");
  const frame = document.querySelector("[data-teacher-frame]");
  const topbar = document.querySelector("[data-teacher-topbar]");
  const searchParams = new URLSearchParams(window.location.search);
  const professorParam = searchParams.get("professor");
  const materiaParam = searchParams.get("materia");
  const turmaParam = searchParams.get("turma");

  const normalizeKey = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const normalizeCompact = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\b(e|a|de|da|do)\b/g, "")
      .replace(/[^a-z0-9]/g, "");

  const findSubjectPresentation = (professor, materiaKey, data) => {
    if (!professor || !materiaKey) return null;
    const rawMap =
      professor.apresentacoesPorMateria ||
      professor.porMateria ||
      professor.materias ||
      null;
    if (!rawMap) return null;

    const targetNorm = normalizeKey(materiaKey);
    const targetCompact = normalizeCompact(materiaKey);

    // Também descobre o nome da oferta/matéria para permitir casamento por nome ou slug
    const ofertaObj = (data?.ofertas || []).find(
      (o) => normalizeKey(o.id) === targetNorm || normalizeCompact(o.id) === targetCompact
    );
    const materiaObj = (data?.materias || []).find(
      (m) => normalizeKey(m.id) === targetNorm || normalizeCompact(m.id) === targetCompact
    );
    const candidateNormals = new Set(
      [
        targetNorm,
        ofertaObj && normalizeKey(ofertaObj.id),
        ofertaObj && normalizeKey(ofertaObj.materiaId),
        ofertaObj && normalizeKey(ofertaObj.nome),
        materiaObj && normalizeKey(materiaObj.id),
        materiaObj && normalizeKey(materiaObj.nome)
      ].filter(Boolean)
    );
    const candidateCompacts = new Set(
      [
        targetCompact,
        ofertaObj && normalizeCompact(ofertaObj.id),
        ofertaObj && normalizeCompact(ofertaObj.materiaId),
        ofertaObj && normalizeCompact(ofertaObj.nome),
        materiaObj && normalizeCompact(materiaObj.id),
        materiaObj && normalizeCompact(materiaObj.nome)
      ].filter(Boolean)
    );

    if (Array.isArray(rawMap)) {
      return (
        rawMap.find((entry) => {
          const entryKey = entry?.materiaId || entry?.ofertaId || entry?.materia || entry?.id;
          if (!entryKey) return false;
          return (
            candidateNormals.has(normalizeKey(entryKey)) ||
            candidateCompacts.has(normalizeCompact(entryKey))
          );
        }) || null
      );
    }

    if (typeof rawMap === "object") {
      if (rawMap[materiaKey]) return rawMap[materiaKey];
      for (const [key, val] of Object.entries(rawMap)) {
        if (
          candidateNormals.has(normalizeKey(key)) ||
          candidateCompacts.has(normalizeCompact(key))
        ) {
          return val;
        }
      }
    }

    return null;
  };

  const resolveProfessorPresentation = (professor, materiaKey, turma, data) => {
    const especifico = findSubjectPresentation(professor, materiaKey, data) || {};

    let biografia = professor.biografia || [];
    if (Array.isArray(especifico.biografia) && especifico.biografia.length > 0) {
      biografia = especifico.biografia;
    } else if (typeof especifico.biografia === "string" && especifico.biografia.trim()) {
      biografia = especifico.biografia
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else if (Array.isArray(turma?.biografiaProfessor) && turma.biografiaProfessor.length > 0) {
      biografia = turma.biografiaProfessor;
    }

    let audio = professor.audio || null;
    if (especifico.audio && especifico.audio.url) {
      audio = especifico.audio;
    } else if (especifico.audioUrl) {
      audio = {
        url: especifico.audioUrl,
        descricao: especifico.audioDescricao || professor.audio?.descricao || ""
      };
    }

    return {
      id: professor.id,
      nome: especifico.nome || professor.nome,
      tratamento: especifico.tratamento || professor.tratamento,
      fotoUrl: especifico.fotoUrl || turma?.fotoProfessorUrl || professor.fotoUrl,
      biografia,
      versiculo:
        especifico.versiculo !== undefined && especifico.versiculo !== ""
          ? especifico.versiculo
          : professor.versiculo,
      audio
    };
  };

  const showMessage = (title, message) => {
    document.title = `${title} | Conectados na Verdade`;
    content.replaceChildren();
    const heading = document.createElement("h1");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    content.append(heading, paragraph);
  };

  if (!professorParam && !turmaParam) {
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
      const turma = turmaParam
        ? (data.turmas || []).find((item) => item.id === turmaParam && item.ativo)
        : null;
      const professorId = professorParam || turma?.professorId;
      const materiaKey = materiaParam || turma?.ofertaId || null;

      const professor = (data.professores || []).find(
        (item) => item.id === professorId && item.ativo
      );
      if (!professor) {
        showMessage("Professor não encontrado", "Confira o endereço usado para abrir este perfil.");
        return;
      }

      const perfil = resolveProfessorPresentation(professor, materiaKey, turma, data);

      document.title = `${perfil.tratamento} ${perfil.nome} | Conectados na Verdade`;
      topbar.textContent = "Voltar";
      if (perfil.fotoUrl) frame.style.backgroundImage = `url("${encodeURI(perfil.fotoUrl)}")`;

      content.replaceChildren();
      const kicker = document.createElement("p");
      kicker.className = "kicker";
      kicker.textContent = perfil.tratamento;
      const heading = document.createElement("h1");
      heading.textContent = perfil.nome;
      content.append(kicker, heading);

      (perfil.biografia || []).forEach((texto) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = texto;
        content.append(paragraph);
      });

      if (perfil.versiculo) {
        const verse = document.createElement("p");
        verse.className = "teacher-verse";
        verse.textContent = perfil.versiculo;
        content.append(verse);
      }

      if (perfil.audio && perfil.audio.url) {
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
        audioEl.src = perfil.audio.url;
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
