document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".back").forEach((backButton) => {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.back();
    });
  });

  const isMenuPage = /(?:^|\/)menu(?:\.html)?$/i.test(window.location.pathname);
  if (isMenuPage) return;

  const isSubdir = window.location.pathname.includes("/depoimentos/") ||
                   window.location.pathname.includes("/turmas/") ||
                   window.location.pathname.includes("/materias/") ||
                   window.location.pathname.includes("/institucional/");

  const homeButton = document.createElement("a");
  homeButton.className = "home-button";
  homeButton.href = isSubdir ? "../menu.html" : "menu.html";
  homeButton.setAttribute("aria-label", "Voltar para Início");
  homeButton.innerHTML = '<span aria-hidden="true">⌂</span> Início';

  const topbar = document.querySelector(".topbar");
  if (topbar) {
    topbar.append(homeButton);
    return;
  }

  const phoneFrame = document.querySelector(".phone-frame");
  if (!phoneFrame) return;

  homeButton.classList.add("home-button--floating");
  if (phoneFrame.matches("a")) {
    homeButton.classList.add("home-button--splash");
    document.body.append(homeButton);
    return;
  }

  phoneFrame.append(homeButton);
});
