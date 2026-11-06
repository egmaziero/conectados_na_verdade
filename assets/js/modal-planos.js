/**
 * modal-planos.js
 * Renderização dinâmica da tabela do Plano de Valores e Promoção com Aliança no modal #modal-planos.
 * Conectados na Verdade
 */

(function () {
  "use strict";

  const FALLBACK_PLANO_DATA = {
    titulo: "Conheça o Plano de Valores",
    subtitulo: "Confira abaixo a relação de matérias, carga horária, valores e promoções:",
    itens: [
      { materia: "Português", carga: "16h aula + 4h", comAlianca: "R$ 203,00", semAlianca: "R$ 225,00" },
      { materia: "Matemática", carga: "16h aula + 4h", comAlianca: "R$ 203,00", semAlianca: "R$ 225,00" },
      { materia: "Ciências", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Geografia", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "História", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Int Química e Física", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Aprendendo a Palavra", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Inglês 4 dias", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Inglês 1 dia", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Hebraico", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Espanhol", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Latim", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Italiano", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Robótica", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Música", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Xadrez", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Artes", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Leitura", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "The maker", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Clube de Eva", carga: "4h aula + 1,3h", comAlianca: "R$ 0,00", semAlianca: "R$ 0,00" },
      { materia: "Clube de Adão", carga: "4h aula + 1,3h", comAlianca: "R$ 0,00", semAlianca: "R$ 0,00" }
    ],
    promocao: {
      titulo: "PROMOÇÃO COM ALIANÇA",
      texto: "Esperamos que as famílias entendam que cada família é um corpo e desempenha a sua função no nosso projeto, espalhar a semente e ajudar a outra família a nos conhecer é uma demanda de cada um de vocês. A recompensa é a promoção especificada no Valor mensal com aliança. Esta promoção visa obter desconto especial para as famílias que:",
      regras: [
        "Trouxerem mais 2 famílias para se aliarem ao nosso projeto, apoiando estas famílias e efetuando suas matrículas.",
        "Aliarem-se por 1 ano com o mestre da matéria escolhida, assim garantindo uma segurança para ambas as partes em contrato."
      ]
    }
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderModalContent(cardEl, data) {
    const plano = data || FALLBACK_PLANO_DATA;
    const itens = plano.itens || [];
    const promocao = plano.promocao || {};
    const regras = promocao.regras || [];

    const rowsHtml = itens
      .map(function (it) {
        return `
          <tr>
            <td><span class="plano-materia-nome">🌾 ${escapeHtml(it.materia)}</span></td>
            <td class="plano-carga">${escapeHtml(it.carga)}</td>
            <td class="plano-com-alianca"><span class="badge-preco">${escapeHtml(it.comAlianca)}</span></td>
            <td class="plano-sem-alianca">${escapeHtml(it.semAlianca)}</td>
          </tr>
        `;
      })
      .join("");

    const regrasHtml = regras
      .map(function (regra, idx) {
        return `
          <li>
            <span class="num-badge">${idx + 1}</span>
            <span>${escapeHtml(regra)}</span>
          </li>
        `;
      })
      .join("");

    cardEl.innerHTML = `
      <button class="modal-close" aria-label="Fechar">&times;</button>
      
      <div class="plano-header">
        <h3 id="modal-planos-title">${escapeHtml(plano.titulo || "Conheça o Plano de Valores")}</h3>
        <p>${escapeHtml(plano.subtitulo || "Confira abaixo a relação de matérias, carga horária, valores e promoções:")}</p>
      </div>

      <div class="plano-tabela-wrap">
        <table class="plano-tabela">
          <thead>
            <tr>
              <th>Matéria</th>
              <th>🕒 Hora aula + Hora produção / sem.</th>
              <th class="th-alianca">💍 Com Aliança</th>
              <th>💍 Sem Aliança</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div class="plano-promocao-card">
        <div class="plano-promocao-title">
          <span>🌿</span>
          <span>${escapeHtml(promocao.titulo || "PROMOÇÃO COM ALIANÇA")}</span>
          <span>🌿</span>
        </div>
        ${promocao.texto ? `<p class="plano-promocao-desc">${escapeHtml(promocao.texto)}</p>` : ""}
        ${regrasHtml ? `<ul class="plano-promocao-regras">${regrasHtml}</ul>` : ""}
      </div>

      <div style="margin-top: 14px; text-align: center;">
        <a href="assets/img/plano-materias.png?v=20261105" target="_blank" rel="noopener noreferrer" style="font-size: 12.5px; color: #8f5f35; text-decoration: none; font-weight: 500;">
          🖼️ Abrir tabela em formato imagem original
        </a>
      </div>
    `;

    // Reanexa evento de fechar
    const closeBtn = cardEl.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        const modal = document.getElementById("modal-planos");
        if (modal) modal.style.display = "none";
      });
    }
  }

  function setupEvents(modal) {
    if (!modal) return;

    // Backdrop click
    const backdrop = modal.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        modal.style.display = "none";
      });
    }

    // Botões que abrem o modal
    const openButtons = document.querySelectorAll(
      '#btn-planos-valores, [data-open-modal="modal-planos"], .btn-planos-valores'
    );
    openButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        modal.style.display = "flex";
      });
    });

    // Tecla ESC para fechar
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  }

  async function init() {
    const modal = document.getElementById("modal-planos");
    if (!modal) return;

    const card = modal.querySelector(".modal-card");
    if (!card) return;

    // Ajusta classes do card para comportar a tabela responsiva
    card.classList.add("modal-planos-card");
    card.style.maxWidth = "680px";
    card.style.width = "95%";
    card.style.maxHeight = "90vh";
    card.style.overflowY = "auto";
    card.style.padding = "22px 18px";

    // Renderiza inicialmente com o fallback para garantir exibição imediata
    renderModalContent(card, FALLBACK_PLANO_DATA);
    setupEvents(modal);

    // Tenta carregar dados atualizados do site-data.example.json ou site-data.json
    try {
      const dataUrl = "assets/data/site-data.example.json?v=" + Date.now();
      const res = await fetch(dataUrl);
      if (res.ok) {
        const json = await res.json();
        if (json && json.planoValores && Array.isArray(json.planoValores.itens)) {
          renderModalContent(card, json.planoValores);
        }
      }
    } catch (e) {
      // Ignora erro de fetch (ex: ambiente file://), dados de fallback já estão renderizados
      console.warn("Plano de valores carregado via fallback local.", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
