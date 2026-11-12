/**
 * valores-page.js
 * Renderização dinâmica da tabela do Plano de Valores e Promoção com Aliança na página valores.html.
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
      { materia: "Química e Física", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Aprendendo a Palavra", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Inglês 4 dias", carga: "8h aula + 2h", comAlianca: "R$ 102,00", semAlianca: "R$ 114,00" },
      { materia: "Inglês 1 dia", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Hebraico", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Espanhol", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Astronomia e fé", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
      { materia: "Latim", carga: "4h aula + 1,3h", comAlianca: "R$ 53,00", semAlianca: "R$ 59,00" },
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

  function renderValores(data) {
    const plano = data || FALLBACK_PLANO_DATA;
    const itens = plano.itens || [];
    const promocao = plano.promocao || {};
    const regras = promocao.regras || [];

    const titleEl = document.getElementById("valores-title");
    if (titleEl && plano.titulo) {
      titleEl.textContent = plano.titulo;
    }

    const subtitleEl = document.getElementById("valores-subtitle");
    if (subtitleEl && plano.subtitulo) {
      subtitleEl.textContent = plano.subtitulo;
    }

    const tbody = document.getElementById("valores-table-body");
    if (tbody && itens.length > 0) {
      tbody.innerHTML = itens
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
    }

    const promoCard = document.getElementById("valores-promocao-card");
    if (promoCard) {
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

      promoCard.innerHTML = `
        <div class="plano-promocao-title">
          <span>🌿</span>
          <span>${escapeHtml(promocao.titulo || "PROMOÇÃO COM ALIANÇA")}</span>
          <span>🌿</span>
        </div>
        ${promocao.texto ? `<p class="plano-promocao-desc">${escapeHtml(promocao.texto)}</p>` : ""}
        ${regrasHtml ? `<ul class="plano-promocao-regras">${regrasHtml}</ul>` : ""}
      `;
    }
  }

  function setupShareWhatsApp() {
    const btn = document.getElementById("btn-share-whatsapp");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const shareUrl = "https://conectadosnaverdade.com.br/valores.html";
      const shareText = "Confira a relação de matérias, carga horária e Plano de Valores do projeto Conectados na Verdade:\n" + shareUrl;
      if (navigator.share) {
        navigator.share({
          title: "Plano de Valores | Conectados na Verdade",
          text: "Confira a relação de matérias, carga horária e Plano de Valores do projeto Conectados na Verdade:",
          url: shareUrl
        }).catch(function () {
          window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(shareText), "_blank");
        });
      } else {
        window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(shareText), "_blank");
      }
    });
  }

  async function init() {
    setupShareWhatsApp();
    try {
      const dataUrl = "assets/data/site-data.example.json?v=" + Date.now();
      const res = await fetch(dataUrl);
      if (res.ok) {
        const json = await res.json();
        if (json && json.planoValores && Array.isArray(json.planoValores.itens)) {
          renderValores(json.planoValores);
        }
      }
    } catch (e) {
      // Ignora erro de fetch (ex: ambiente offline/file://)
      console.warn("Valores carregados a partir do fallback local.", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
