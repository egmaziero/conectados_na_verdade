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

        if (turma.audioEpecificoUrl) {
          const audio = document.createElement("audio");
          audio.controls = true;
          audio.preload = "metadata";
          audio.src = turma.audioEpecificoUrl;
          audio.style.marginTop = "20px";
          audio.style.width = "100%";
          content.append(audio);
        } else {
          const p = document.createElement("p");
          p.textContent = "Nenhuma mensagem disponível no momento.";
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
