document.addEventListener("DOMContentLoaded", () => {
  const homeButton = document.createElement("a");
  homeButton.className = "home-button";
  homeButton.href = "inicio.html";
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
