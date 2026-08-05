const splashBody = document.querySelector("[data-splash]");
if (splashBody) {
  document.addEventListener("click", () => {
    window.location.href = "inicio.html";
  });
}

const audioButton = document.querySelector("[data-play-welcome]");
const welcomeAudio = document.querySelector("#welcome-audio");

if (audioButton && welcomeAudio) {
  audioButton.addEventListener("click", async () => {
    try {
      await welcomeAudio.play();
      audioButton.textContent = "Entrar no site";
      setTimeout(() => {
        window.location.href = "menu.html";
      }, 650);
    } catch {
      window.location.href = "menu.html";
    }
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copiado!";
      setTimeout(() => (button.textContent = original), 1500);
    } catch {
      alert("Copie a chave PIX: " + value);
    }
  });
});

const form = document.querySelector("[data-enrollment-form]");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(form));
    const message = `Olá! Quero fazer a matrícula.%0A%0ANome: ${params.get("nome") || ""}%0ATelefone: ${params.get("telefone") || ""}%0ACurso: ${params.get("curso") || ""}`;
    window.location.href = `https://wa.me/?text=${message}`;
  });
}
