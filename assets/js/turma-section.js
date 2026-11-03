(() => {
  const content = document.querySelector(".teacher-bio");
  const turmaId = new URLSearchParams(window.location.search).get("turma");
  const sectionType = document.body.getAttribute("data-section");

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
    showMessage("Turma não informada", "Use um link com o parâmetro turma.");
    return;
  }

  fetch("assets/data/site-data.example.json")
    .then((response) => response.json())
    .then((data) => {
      const turma = data.turmas.find((item) => item.id === turmaId && item.ativo);
      if (!turma) {
        showMessage("Turma não encontrada", "Turma inválida.");
        return;
      }

      const professor = data.professores.find((item) => item.id === turma.professorId && item.ativo);
      content.replaceChildren();

      const kicker = document.createElement("p");
      kicker.className = "kicker";
      
      const heading = document.createElement("h1");

      if (sectionType === "detalhes") {
        kicker.textContent = "Detalhes da Turma";
        heading.textContent = `${professor ? professor.tratamento + ' ' + professor.nome : 'Professor'}`;
        
        const diasNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const diasStr = turma.dias ? turma.dias.map(d => diasNomes[d]).join(", ") : "";
        
        let publicoStr = turma.publico?.rotulo || "";
        if (!publicoStr && turma.publico?.idadeMin && turma.publico?.idadeMax) {
            publicoStr = `${turma.publico.idadeMin} a ${turma.publico.idadeMax} anos`;
        }

        const info = document.createElement("p");
        info.innerHTML = `
          <strong>Público:</strong> ${publicoStr} - ${turma.publico?.nivel || ""}<br/>
          <strong>Horário:</strong> ${turma.horaInicio} (${turma.duracaoMinutos} min)<br/>
          <strong>Dias:</strong> ${diasStr}
        `;
        content.append(kicker, heading, info);
      } 
      else if (sectionType === "mensagem") {
        kicker.textContent = "Mensagem";
        heading.textContent = "Para a Turma";
        content.append(kicker, heading);

        // Coleta todos os áudios disponíveis para a turma
        const audios = [];

        // 1. Array de áudios explícito no JSON (caso exista)
        if (Array.isArray(turma.audios)) {
          turma.audios.forEach((item) => {
            if (typeof item === "string" && item.trim()) {
              audios.push({ url: item.trim(), titulo: "Áudio" });
            } else if (item && item.url) {
              audios.push({
                url: item.url.trim(),
                titulo: item.titulo || item.descricao || "Áudio"
              });
            }
          });
        }

        // 2. Áudio principal / específico da turma ou apresentação do professor
        const audioPrincipalUrl = turma.audioEpecificoUrl || (professor && professor.audio && professor.audio.url);
        if (audioPrincipalUrl && !audios.some(a => a.url === audioPrincipalUrl)) {
          let tituloPrincipal = turma.audioEpecificoTitulo || turma.audioTitulo;
          if (!tituloPrincipal) {
            if (professor && professor.nome) {
              const trat = professor.tratamento ? professor.tratamento + " " : "";
              tituloPrincipal = `Áudio de Apresentação – ${trat}${professor.nome}`;
            } else {
              tituloPrincipal = "Áudio de Apresentação";
            }
          }
          audios.push({
            url: audioPrincipalUrl,
            titulo: tituloPrincipal
          });
        }

        // 3. Segundo áudio / Áudio extra / Trilha Curricular
        const audioExtraUrl = turma.audioExtraUrl || turma.audioTrilhaCurricularUrl || turma.audioCurriculoUrl || turma.audioSegundoUrl || turma.audioIaUrl;
        if (audioExtraUrl && !audios.some(a => a.url === audioExtraUrl)) {
          const tituloExtra = turma.audioExtraTitulo || turma.audioTrilhaCurricularTitulo || turma.audioCurriculoTitulo || turma.audioSegundoTitulo || turma.audioIaTitulo || "Áudio Adicional";
          audios.push({
            url: audioExtraUrl,
            titulo: tituloExtra
          });
        }

        if (audios.length > 0) {
          const container = document.createElement("div");
          container.className = "turma-audios-container";
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.gap = "14px";
          container.style.marginTop = "18px";
          container.style.width = "100%";

          audios.forEach((audioItem) => {
            const box = document.createElement("div");
            box.className = "turma-audio-box";
            box.style.background = "rgba(255, 255, 255, 0.78)";
            box.style.border = "1px solid rgba(223, 207, 188, 0.7)";
            box.style.borderRadius = "14px";
            box.style.padding = "12px 14px";
            box.style.boxShadow = "0 3px 10px rgba(35, 20, 10, 0.05)";

            if (audioItem.titulo) {
              const titleEl = document.createElement("p");
              titleEl.style.fontWeight = "bold";
              titleEl.style.fontSize = "13.5px";
              titleEl.style.color = "#4a3424";
              titleEl.style.marginBottom = "8px";
              titleEl.style.lineHeight = "1.35";
              titleEl.textContent = `🎙️ ${audioItem.titulo}`;
              box.append(titleEl);
            }

            const audioEl = document.createElement("audio");
            audioEl.controls = true;
            audioEl.preload = "metadata";
            audioEl.src = audioItem.url;
            audioEl.style.width = "100%";
            audioEl.style.display = "block";

            // Pausa os outros reprodutores quando este iniciar
            audioEl.addEventListener("play", () => {
              container.querySelectorAll("audio").forEach((other) => {
                if (other !== audioEl && !other.paused) {
                  other.pause();
                }
              });
            });

            box.append(audioEl);
            container.append(box);
          });

          content.append(container);
        } else {
          const p = document.createElement("p");
          p.textContent = "Nenhum áudio disponível no momento.";
          content.append(p);
        }
      }
      else if (sectionType === "material") {
        kicker.textContent = "Material Recomendado";
        content.append(kicker);
        
        const material = (data.materiais || []).find((m) => m.id === turma.materialId);
        if (material) {
          heading.textContent = material.nome;
          content.append(heading);

          const info = document.createElement("p");
          let html = "";
          if (material.precoCentavos) {
              html += `Valor: ${(material.precoCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
          }
          if (material.links?.planoCurricular) {
              html += `<br/><br/><a href="${material.links.planoCurricular}" target="_blank">Ver Plano Curricular</a>`;
          }
          info.innerHTML = html;
          content.append(info);
        } else {
          heading.textContent = turma.materialId || "Material não especificado";
          content.append(heading);
        }
      }
    })
    .catch((err) => {
      console.error(err);
      showMessage("Erro", "Não foi possível carregar os dados.");
    });
})();
